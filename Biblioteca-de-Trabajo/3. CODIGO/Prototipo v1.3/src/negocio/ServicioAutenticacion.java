package negocio;

import datos.UsuarioRepo;
import datos.PerfilRepo;
import datos.FiCitasDB;
import modelos.Usuario;
import modelos.Perfil;

public class ServicioAutenticacion implements IServicioFiCitas {
    private UsuarioRepo usuarioRepo = new UsuarioRepo();
    private PerfilRepo perfilRepo = new PerfilRepo();
    private GestorEventos gestor;

    public ServicioAutenticacion(GestorEventos gestor) {
        this.gestor = gestor;
    }

    public static class AuthResult {
        public boolean exito;
        public String mensaje;
        public Usuario usuario;
        public Perfil perfil;
        
        public AuthResult(boolean exito, String mensaje, Usuario u, Perfil p) {
            this.exito = exito; this.mensaje = mensaje; this.usuario = u; this.perfil = p;
        }
    }

    public AuthResult iniciarSesion(String correo, String contrasena) {
        Usuario u = usuarioRepo.obtenerPorCorreo(correo);
        if (u == null) return new AuthResult(false, "Usuario no encontrado.", null, null);

        if (u.getEstado().equals("Bloqueado")) {
            gestor.notificar(String.valueOf(u.getId()), "Desconocido", "INTENTO_ACCESO_BLOQUEADO", "Correo: " + correo);
            return new AuthResult(false, "El usuario está bloqueado por múltiples intentos fallidos.", null, null);
        }

        if (!u.getContrasena().equals(contrasena)) {
            u.setIntentosFallidos(u.getIntentosFallidos() + 1);
            if (u.getIntentosFallidos() >= 3) {
                u.setEstado("Bloqueado");
                usuarioRepo.actualizar(u);
                gestor.notificar(String.valueOf(u.getId()), "Desconocido", "BLOQUEO_USUARIO", "Excedió intentos");
                return new AuthResult(false, "Contraseña incorrecta. Usuario bloqueado por seguridad.", null, null);
            }
            usuarioRepo.actualizar(u);
            return new AuthResult(false, "Contraseña incorrecta. Intento " + u.getIntentosFallidos() + "/3.", null, null);
        }

        u.setIntentosFallidos(0);
        usuarioRepo.actualizar(u);

        Perfil p = perfilRepo.obtenerPorId(u.getPerfilId());
        if (p == null || !p.getEstado().equals("Activo")) {
            return new AuthResult(false, "El perfil del usuario está inactivo o no existe.", null, null);
        }

        gestor.notificar(String.valueOf(u.getId()), p.getNombre(), "INICIO_SESION", "Exitoso");
        return new AuthResult(true, "Exito", u, p);
    }

    public AuthResult recuperarContrasena(String correo) {
        Usuario u = usuarioRepo.obtenerPorCorreo(correo);
        if (u == null) return new AuthResult(false, "El correo no está registrado.", null, null);

        if (FiCitasDB.recuperacionesPendientes.contains(correo)) {
            return new AuthResult(false, "Ya se envió un enlace de recuperación anteriormente.", null, null);
        }

        FiCitasDB.recuperacionesPendientes.add(correo);
        gestor.notificar(String.valueOf(u.getId()), "Desconocido", "SOLICITUD_RECUPERACION", "Correo: " + correo);
        return new AuthResult(true, "Se ha simulado el envío del enlace de recuperación.", null, null);
    }

    public AuthResult cambiarContrasena(String correo, String nuevaContrasena) {
        Usuario u = usuarioRepo.obtenerPorCorreo(correo);
        if (u == null) return new AuthResult(false, "Usuario no encontrado.", null, null);

        if (!FiCitasDB.recuperacionesPendientes.contains(correo)) {
            return new AuthResult(false, "No hay solicitud de recuperación pendiente para este correo.", null, null);
        }

        u.setContrasena(nuevaContrasena);
        u.setIntentosFallidos(0);
        if(u.getEstado().equals("Bloqueado")) {
            u.setEstado("Activo");
        }
        usuarioRepo.actualizar(u);
        FiCitasDB.recuperacionesPendientes.remove(correo);
        
        gestor.notificar(String.valueOf(u.getId()), "Desconocido", "CAMBIO_CONTRASENA", "Exitoso");
        return new AuthResult(true, "Contraseña actualizada exitosamente.", null, null);
    }
}
