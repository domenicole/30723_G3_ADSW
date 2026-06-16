package datos;

import modelos.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class FiCitasDB {
    public static List<Perfil> perfiles = new ArrayList<>();
    public static List<Usuario> usuarios = new ArrayList<>();
    public static List<Paciente> pacientes = new ArrayList<>();
    public static List<Cita> citas = new ArrayList<>();
    public static List<Auditoria> auditorias = new ArrayList<>();
    public static List<String> recuperacionesPendientes = new ArrayList<>();

    static {
        perfiles.add(new Perfil(1, "Administrador", "Control total del sistema", "Activo", 
            Arrays.asList("GESTION_CITAS", "GESTION_PACIENTES", "GESTION_HORARIOS", "GESTION_PLANIFICACION", "GESTION_PERFILES")));
        perfiles.add(new Perfil(2, "Auxiliar", "Gestión de pacientes y citas", "Activo", 
            Arrays.asList("GESTION_PACIENTES", "GESTION_CITAS")));
        perfiles.add(new Perfil(3, "Fisioterapeuta", "Atención de citas y planes", "Activo", 
            Arrays.asList("VER_CITAS", "VER_HISTORIAL")));

        usuarios.add(new Usuario(1, "admin@ficitas.com", "admin123", 1, "Activo"));
        usuarios.add(new Usuario(2, "auxiliar@ficitas.com", "aux123", 2, "Activo"));
        usuarios.add(new Usuario(3, "fisio@ficitas.com", "fisio123", 3, "Activo"));

        pacientes.add(new Paciente(1, "0912345678", "Juan Perez", "0991234567", "1990-05-15", "Calle 1 y Av. 2", "Ingeniero", "Soltero", "Activo"));
        pacientes.add(new Paciente(2, "0987654321", "Maria Gomez", "0987654321", "1985-10-20", "Alborada 4ta", "Docente", "Casada", "Activo"));

        citas.add(new Cita(1, 1, "2026-12-01", "10:00", "Pendiente"));
    }
}
