package negocio;

import datos.PerfilRepo;
import datos.UsuarioRepo;
import modelos.Perfil;
import modelos.Usuario;
import java.util.List;

public class ServicioPerfiles implements IServicioFiCitas {
    private PerfilRepo perfilRepo = new PerfilRepo();
    private UsuarioRepo usuarioRepo = new UsuarioRepo();
    private GestorEventos gestor;
    private Usuario usuarioActual;
    private Perfil perfilActual;

    public ServicioPerfiles(GestorEventos gestor, Usuario u, Perfil p) {
        this.gestor = gestor;
        this.usuarioActual = u;
        this.perfilActual = p;
    }

    public static class OpResult {
        public boolean exito;
        public String mensaje;
        public OpResult(boolean e, String m) { exito = e; mensaje = m; }
    }

    public List<Perfil> obtenerPerfiles() {
        return perfilRepo.obtenerTodos();
    }

    public OpResult registrarPerfil(String nombre, String descripcion, List<String> permisos) {
        for (Perfil p : perfilRepo.obtenerTodos()) {
            if (p.getNombre().equalsIgnoreCase(nombre)) {
                return new OpResult(false, "Ya existe un perfil con ese nombre.");
            }
        }

        Perfil nuevo = new Perfil(0, nombre, descripcion, "Activo", permisos);
        Perfil creado = perfilRepo.crear(nuevo);
        
        gestor.notificar(String.valueOf(usuarioActual.getId()), perfilActual.getNombre(), "CREAR_PERFIL", "Perfil: " + nombre);
        return new OpResult(true, "Perfil creado exitosamente.");
    }

    public OpResult modificarPerfil(int id, String nombre, String descripcion, String estado, List<String> permisos) {
        Perfil p = perfilRepo.obtenerPorId(id);
        if (p == null) return new OpResult(false, "Perfil no encontrado.");

        if (!p.getNombre().equalsIgnoreCase(nombre)) {
            for (Perfil ext : perfilRepo.obtenerTodos()) {
                if (ext.getId() != id && ext.getNombre().equalsIgnoreCase(nombre)) {
                    return new OpResult(false, "Ya existe otro perfil con ese nombre.");
                }
            }
        }

        if (estado.equals("Inactivo") && p.getEstado().equals("Activo")) {
            if (p.getNombre().equals("Administrador")) {
                long adminsActivos = perfilRepo.obtenerTodos().stream().filter(ext -> ext.getNombre().equals("Administrador") && ext.getEstado().equals("Activo")).count();
                if (adminsActivos <= 1) return new OpResult(false, "No se puede desactivar el único perfil Administrador activo.");
            }

            List<Usuario> usuariosAsignados = usuarioRepo.obtenerPorPerfil(id);
            if (!usuariosAsignados.isEmpty()) {
                return new OpResult(false, "El perfil tiene usuarios asignados. Reasígnelos antes de desactivar.");
            }
        }

        if (p.getNombre().equals("Administrador") && !permisos.contains("GESTION_PERFILES")) {
            return new OpResult(false, "No se puede retirar el permiso de gestionar perfiles al Administrador.");
        }

        p.setNombre(nombre);
        p.setDescripcion(descripcion);
        p.setEstado(estado);
        p.setPermisos(permisos);
        perfilRepo.actualizar(p);

        gestor.notificar(String.valueOf(usuarioActual.getId()), perfilActual.getNombre(), "MODIFICAR_PERFIL", "Perfil ID: " + id);
        return new OpResult(true, "Perfil modificado exitosamente.");
    }
}
