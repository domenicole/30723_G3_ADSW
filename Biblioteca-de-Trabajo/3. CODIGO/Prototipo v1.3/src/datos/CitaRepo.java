package datos;

import modelos.Cita;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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

    public List<Cita> obtenerTodas() {
        return new ArrayList<>(FiCitasDB.citas);
    }

    public Cita obtenerPorId(int id) {
        for (Cita c : FiCitasDB.citas) {
            if (c.getId() == id) return c;
        }
        return null;
    }

    public Cita crear(Cita cita) {
        int maxId = 0;
        for (Cita c : FiCitasDB.citas) {
            if (c.getId() > maxId) maxId = c.getId();
        }
        cita.setId(maxId + 1);
        FiCitasDB.citas.add(cita);
        return cita;
    }

    public void actualizar(Cita cita) {
        for (int i = 0; i < FiCitasDB.citas.size(); i++) {
            if (FiCitasDB.citas.get(i).getId() == cita.getId()) {
                FiCitasDB.citas.set(i, cita);
                return;
            }
        }
    }
}
