package datos;

import modelos.Cita;
import java.time.LocalDate;

public class CitaRepo {
    public boolean tieneCitasFuturas(int pacienteId) {
        String hoy = LocalDate.now().toString();
        for (Cita c : FiCitasDB.citas) {
            if (c.getPacienteId() == pacienteId && c.getFecha().compareTo(hoy) >= 0 && !c.getEstado().equals("Cancelada")) {
                return true;
            }
        }
        return false;
    }
}
