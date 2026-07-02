package negocio;

import java.time.LocalDate;
import java.time.Period;

public class ValidacionDecorador extends ServicioBaseDecorador<ServicioPacientes> {

    public ValidacionDecorador(ServicioPacientes base) {
        super(base);
    }

    // Delega obtención
    public java.util.List<modelos.Paciente> obtenerPacientes() {
        return servicioBase.obtenerPacientes();
    }

    public ServicioPacientes.OpResult modificarPaciente(int id, String domicilio, String telefono, String ocupacion, String estadoCivil) {
        return servicioBase.modificarPaciente(id, domicilio, telefono, ocupacion, estadoCivil);
    }

    public ServicioPacientes.OpResult cambiarEstado(int id, String estado) {
        return servicioBase.cambiarEstado(id, estado);
    }

    // Intercepta registro para validar
    public ServicioPacientes.OpResult registrarPaciente(String cedula, String nombre, String telefono, String fechaNacimiento, String domicilio, String ocupacion, String estadoCivil, String edadRecibidaStr) {
        System.out.println("[DECORATOR - Validación] Interceptando creación de paciente para validar formatos...");
        if (cedula.isEmpty() || nombre.isEmpty() || telefono.isEmpty() || fechaNacimiento.isEmpty() || domicilio.isEmpty() || ocupacion.isEmpty() || estadoCivil.isEmpty() || edadRecibidaStr.isEmpty()) {
            return new ServicioPacientes.OpResult(false, "Todos los campos son obligatorios.");
        }

        if (cedula.length() != 10 || !cedula.matches("\\d+")) {
            return new ServicioPacientes.OpResult(false, "La cédula debe tener 10 dígitos numéricos.");
        }

        if (telefono.length() != 10 || !telefono.matches("\\d+")) {
            return new ServicioPacientes.OpResult(false, "El teléfono debe tener 10 dígitos numéricos.");
        }

        try {
            LocalDate fechaNac = LocalDate.parse(fechaNacimiento);
            LocalDate hoy = LocalDate.now();
            int edadCalculada = Period.between(fechaNac, hoy).getYears();
            int edadRecibida = Integer.parseInt(edadRecibidaStr);

            if (edadCalculada != edadRecibida) {
                return new ServicioPacientes.OpResult(false, "La edad no es consistente con la fecha de nacimiento (debería ser " + edadCalculada + ").");
            }
        } catch (Exception e) {
            return new ServicioPacientes.OpResult(false, "Formato de fecha inválido (YYYY-MM-DD) o edad no numérica.");
        }

        // Si pasa todo, delega al servicio base
        return servicioBase.registrarPaciente(cedula, nombre, telefono, fechaNacimiento, domicilio, ocupacion, estadoCivil);
    }
}
