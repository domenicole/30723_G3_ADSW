package controller;

import model.Estudiante;
import model.RepositorioEstudiantes;
import view.FormularioCrudEstudiante;
import java.util.List;

/**
 * Clase ControlEstudiante - Controlador
 * Maneja la lógica de negocio y la comunicación entre Vista y Repositorio
 * Arquitectura MVC - CONTROLLER
 */
public class ControlEstudiante {
    private RepositorioEstudiantes repositorio;
    private FormularioCrudEstudiante vista;

    public ControlEstudiante(RepositorioEstudiantes repositorio, FormularioCrudEstudiante vista) {
        this.repositorio = repositorio;
        this.vista = vista;
        this.vista.setControlador(this);
    }

    /**
     * Valida los datos del estudiante
     */
    public String validarDatos(String id, String nombre, String edad) {
        // Validar ID
        if (id == null || id.trim().isEmpty()) {
            return "El ID es obligatorio.";
        }

        // Validar que el ID sea único
        if (repositorio.existeId(id)) {
            return "El ID ya existe.";
        }

        // Validar Nombre
        if (nombre == null || nombre.trim().isEmpty()) {
            return "El Nombre es obligatorio.";
        }

        // Validar Edad
        if (edad == null || edad.trim().isEmpty()) {
            return "La Edad es obligatoria.";
        }

        try {
            int edadInt = Integer.parseInt(edad);
            if (edadInt <= 0 || edadInt > 120) {
                return "La Edad debe ser numérica y estar en un rango válido (1-120).";
            }
        } catch (NumberFormatException e) {
            return "La Edad debe ser numérica.";
        }

        return null; // Sin errores
    }

    /**
     * Agrega un nuevo estudiante (RF-01)
     */
    public void agregarEstudiante(String id, String nombre, String edad) {
        String error = validarDatos(id, nombre, edad);
        if (error != null) {
            vista.mostrarMensaje(error);
            return;
        }

        Estudiante estudiante = new Estudiante(id, nombre, Integer.parseInt(edad));
        repositorio.guardar(estudiante);
        vista.mostrarMensaje("Estudiante agregado exitosamente.");
    }

    /**
     * Actualiza un estudiante existente (RF-02)
     */
    public void actualizarEstudiante(String id, String nombre, String edad) {
        Estudiante estudiante = repositorio.buscarPorId(id);
        if (estudiante == null) {
            vista.mostrarMensaje("Estudiante no encontrado.");
            return;
        }

        // Validar nombre
        if (nombre == null || nombre.trim().isEmpty()) {
            vista.mostrarMensaje("El Nombre es obligatorio.");
            return;
        }

        // Validar edad
        if (edad == null || edad.trim().isEmpty()) {
            vista.mostrarMensaje("La Edad es obligatoria.");
            return;
        }

        try {
            int edadInt = Integer.parseInt(edad);
            if (edadInt <= 0 || edadInt > 120) {
                vista.mostrarMensaje("La Edad debe ser numérica y estar en un rango válido (1-120).");
                return;
            }

            Estudiante estudianteActualizado = new Estudiante(id, nombre, edadInt);
            repositorio.actualizar(estudianteActualizado);
            vista.mostrarMensaje("Estudiante actualizado exitosamente.");
        } catch (NumberFormatException e) {
            vista.mostrarMensaje("La Edad debe ser numérica.");
        }
    }

    /**
     * Elimina un estudiante (RF-03)
     */
    public void eliminarEstudiante(String id) {
        if (id == null || id.trim().isEmpty()) {
            vista.mostrarMensaje("Por favor ingresa un ID para eliminar.");
            return;
        }

        Estudiante estudiante = repositorio.buscarPorId(id);
        if (estudiante == null) {
            vista.mostrarMensaje("Estudiante no encontrado.");
            return;
        }

        repositorio.eliminar(id);
        vista.mostrarMensaje("Estudiante eliminado exitosamente.");
    }

    /**
     * Muestra todos los estudiantes (RF-04)
     */
    public void mostrarTodos() {
        List<Estudiante> estudiantes = repositorio.listarTodos();
        
        if (estudiantes.isEmpty()) {
            vista.mostrarMensaje("No hay estudiantes registrados.");
            vista.mostrarTablaEstudiantes(estudiantes);
        } else {
            vista.mostrarMensaje("Total de estudiantes: " + estudiantes.size());
            vista.mostrarTablaEstudiantes(estudiantes);
        }
    }
}
