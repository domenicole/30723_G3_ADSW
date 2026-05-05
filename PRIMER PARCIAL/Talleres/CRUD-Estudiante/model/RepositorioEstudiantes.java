package model;

import java.util.ArrayList;
import java.util.List;

/**
 * Clase RepositorioEstudiantes - Capa de persistencia
 * Maneja el almacenamiento de estudiantes en memoria
 * Patrón Repository
 */
public class RepositorioEstudiantes {
    private List<Estudiante> almacen = new ArrayList<>();

    public boolean existeId(String id) {
        return buscarPorId(id) != null;
    }

    public void guardar(Estudiante estudiante) {
        almacen.add(estudiante);
    }

    public Estudiante buscarPorId(String id) {
        for (Estudiante est : almacen) {
            if (est.getId().equals(id)) {
                return est;
            }
        }
        return null;
    }

    public void actualizar(Estudiante estudiante) {
        for (int i = 0; i < almacen.size(); i++) {
            if (almacen.get(i).getId().equals(estudiante.getId())) {
                almacen.set(i, estudiante);
                break;
            }
        }
    }

    public void eliminar(String id) {
        for (int i = 0; i < almacen.size(); i++) {
            if (almacen.get(i).getId().equals(id)) {
                almacen.remove(i);
                break;
            }
        }
    }

    public List<Estudiante> listarTodos() {
        return new ArrayList<>(almacen);
    }
}
