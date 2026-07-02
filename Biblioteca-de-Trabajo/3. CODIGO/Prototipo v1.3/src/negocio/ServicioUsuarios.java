package negocio;

import datos.UsuarioRepo;
import datos.FiCitasDB;
import modelos.Usuario;
import java.util.List;

public class ServicioUsuarios implements IServicioFiCitas {
    private UsuarioRepo usuarioRepo = new UsuarioRepo();
    private GestorEventos gestor;
    private Usuario usuarioActual;

    public ServicioUsuarios(GestorEventos gestor, Usuario u) {
        this.gestor = gestor;
        this.usuarioActual = u;
    }

    public static class OpResult {
        public boolean exito;
        public String mensaje;
        public OpResult(boolean e, String m) { exito = e; mensaje = m; }
    }

    public List<Usuario> obtenerUsuarios() {
        return FiCitasDB.usuarios; // Simulado
    }

    public OpResult registrarUsuario(String correo, String contrasena, int perfilId) {
        if (correo.isEmpty() || contrasena.isEmpty()) {
            return new OpResult(false, "Todos los campos son obligatorios.");
        }
        
        // Validación de formato de correo con Regex básico
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        if (!correo.matches(emailRegex)) {
            return new OpResult(false, "El formato del correo electrónico no es válido.");
        }

        if (usuarioRepo.obtenerPorCorreo(correo) != null) {
            return new OpResult(false, "El correo ya está registrado.");
        }
        
        int maxId = 0;
        for (Usuario u : FiCitasDB.usuarios) {
            if (u.getId() > maxId) maxId = u.getId();
        }
        
        Usuario nuevo = new Usuario(maxId + 1, correo, contrasena, perfilId, "Activo");
        FiCitasDB.usuarios.add(nuevo);
        
        gestor.notificar(String.valueOf(usuarioActual.getId()), "Administrador", "CREAR_USUARIO", "Correo: " + correo);
        return new OpResult(true, "Usuario registrado exitosamente.");
    }
}
