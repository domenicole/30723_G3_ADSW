package negocio;

import datos.PacienteRepo;
import datos.CitaRepo;
import modelos.Paciente;
import java.util.List;

public class ServicioPacientes implements IServicioFiCitas {
    private PacienteRepo pacienteRepo = new PacienteRepo();
    private CitaRepo citaRepo = new CitaRepo();

    public static class OpResult {
        public boolean exito;
        public String mensaje;
        public OpResult(boolean e, String m) { exito = e; mensaje = m; }
    }

    public List<Paciente> obtenerPacientes() {
        return pacienteRepo.obtenerTodos();
    }

    public OpResult registrarPaciente(String cedula, String nombre, String telefono, String fechaNacimiento, String domicilio, String ocupacion, String estadoCivil) {
        Paciente nuevo = new Paciente(0, cedula, nombre, telefono, fechaNacimiento, domicilio, ocupacion, estadoCivil, "Activo");
        pacienteRepo.crear(nuevo);
        return new OpResult(true, "Paciente registrado exitosamente.");
    }

    public OpResult modificarPaciente(int id, String domicilio, String telefono, String ocupacion, String estadoCivil) {
        Paciente p = pacienteRepo.obtenerPorId(id);
        if (p == null) return new OpResult(false, "Paciente no encontrado.");

        p.setDomicilio(domicilio);
        p.setTelefono(telefono);
        p.setOcupacion(ocupacion);
        p.setEstadoCivil(estadoCivil);
        pacienteRepo.actualizar(p);

        return new OpResult(true, "Paciente modificado exitosamente.");
    }

    public OpResult cambiarEstado(int id, String nuevoEstado) {
        Paciente p = pacienteRepo.obtenerPorId(id);
        if (p == null) return new OpResult(false, "Paciente no encontrado.");

        if (nuevoEstado.equals("Inactivo")) {
            if (citaRepo.tieneCitasFuturas(id)) {
                return new OpResult(false, "Datos erróneos (El paciente tiene citas programadas a futuro).");
            }
        }

        p.setEstado(nuevoEstado);
        pacienteRepo.actualizar(p);
        return new OpResult(true, "Estado cambiado exitosamente.");
    }
}
