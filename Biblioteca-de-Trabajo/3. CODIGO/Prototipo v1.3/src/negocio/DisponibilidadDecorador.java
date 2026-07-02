package negocio;

import datos.PacienteRepo;
import datos.CitaRepo;
import modelos.Paciente;
import modelos.Cita;

public class DisponibilidadDecorador extends ServicioBaseDecorador<ServicioCitas> {
    private PacienteRepo pacienteRepo = new PacienteRepo();
    private CitaRepo citaRepo = new CitaRepo();

    public DisponibilidadDecorador(ServicioCitas base) {
        super(base);
    }

    public ServicioCitas.OpResult cancelarCita(int citaId, String motivo) {
        return servicioBase.cancelarCita(citaId, motivo);
    }
    
    public java.util.List<Cita> obtenerTodas() {
        return servicioBase.obtenerTodas();
    }

    public ServicioCitas.OpResult registrarCita(int pacienteId, String servicio, String consultorio, String fecha, String hora, int duracionStr) {
        System.out.println("[DECORATOR - Disponibilidad] Verificando estado activo del paciente y disponibilidad de horarios...");
        
        Paciente p = pacienteRepo.obtenerPorId(pacienteId);
        if (p == null || !p.getEstado().equals("Activo")) {
            return new ServicioCitas.OpResult(false, "Error: El paciente no existe o se encuentra Inactivo.");
        }

        for (Cita c : citaRepo.obtenerTodas()) {
            if (!c.getEstado().equals("Cancelada")) {
                if (c.getFecha().equals(fecha) && c.getHora().equals(hora) && c.getConsultorio().equals(consultorio)) {
                    return new ServicioCitas.OpResult(false, "Solapamiento: El " + consultorio + " ya está ocupado a esa hora.");
                }
            }
        }

        return servicioBase.registrarCita(pacienteId, servicio, consultorio, fecha, hora, duracionStr);
    }
}
