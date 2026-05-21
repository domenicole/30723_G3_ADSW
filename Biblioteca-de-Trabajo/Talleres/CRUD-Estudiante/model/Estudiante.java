package model;

/**
 * Clase Estudiante - Modelo de datos
 * Representa un estudiante con ID, Nombre y Edad
 * Arquitectura MVC - MODEL
 */
public class Estudiante {
    private String id;
    private String nombre;
    private int edad;

    // Constructor
    public Estudiante(String id, String nombre, int edad) {
        this.id = id;
        this.nombre = nombre;
        this.edad = edad;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public int getEdad() {
        return edad;
    }

    @Override
    public String toString() {
        return "ID: " + id + " | Nombre: " + nombre + " | Edad: " + edad;
    }
}
