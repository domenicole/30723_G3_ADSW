package negocio;

import datos.CitaRepo;
import modelos.Cita;
import java.util.List;
import java.util.UUID;

public class ServicioCitas implements IServicioFiCitas {
    private CitaRepo citaRepo = new CitaRepo();
    private GestorEventos gestor;
    private int usuarioLogueadoId;

    public ServicioCitas(GestorEventos gestor, int usuarioLogueadoId) {
        this.gestor = gestor;
        this.usuarioLogueadoId = usuarioLogueadoId;
    }

    public static class OpResult {
        public boolean exito;
        public String mensaje;
        public Cita cita;
        public OpResult(boolean e, String m) { exito = e; mensaje = m; }
        public OpResult(boolean e, String m, Cita c) { exito = e; mensaje = m; cita = c; }
    }

    public List<Cita> obtenerTodas() {
        return citaRepo.obtenerTodas();
    }

    public OpResult registrarCita(int pacienteId, String servicio, String consultorio, String fecha, String hora, int duracion) {
        String codigo = "CITA-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        Cita nueva = new Cita(0, pacienteId, servicio, consultorio, fecha, hora, duracion, codigo, "Programada");
        citaRepo.crear(nueva);
        gestor.notificar(String.valueOf(usuarioLogueadoId), "Auxiliar", "CREAR_CITA", "Código: " + codigo);
        return new OpResult(true, "Cita agendada. Código: " + codigo, nueva);
    }

    public OpResult cancelarCita(int citaId, String motivo) {
        if(motivo == null || motivo.trim().isEmpty()) {
            return new OpResult(false, "El motivo de cancelación es obligatorio.");
        }
        Cita c = citaRepo.obtenerPorId(citaId);
        if (c == null) return new OpResult(false, "Cita no encontrada.");

        c.setEstado("Cancelada");
        c.setMotivoCancelacion(motivo);
        citaRepo.actualizar(c);
        gestor.notificar(String.valueOf(usuarioLogueadoId), "Auxiliar", "CANCELAR_CITA", "Motivo: " + motivo);
        return new OpResult(true, "Cita cancelada exitosamente.");
    }
}
