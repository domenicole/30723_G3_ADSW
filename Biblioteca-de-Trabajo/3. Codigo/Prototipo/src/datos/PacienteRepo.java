package datos;

import modelos.Paciente;
import java.util.ArrayList;
import java.util.List;

public class PacienteRepo {
    public List<Paciente> obtenerTodos() {
        return new ArrayList<>(FiCitasDB.pacientes);
    }

    public Paciente obtenerPorId(int id) {
        for (Paciente p : FiCitasDB.pacientes) {
            if (p.getId() == id) {
                return p;
            }
        }
        return null;
    }

    public Paciente crear(Paciente paciente) {
        int maxId = 0;
        for (Paciente p : FiCitasDB.pacientes) {
            if (p.getId() > maxId) maxId = p.getId();
        }
        paciente.setId(maxId + 1);
        FiCitasDB.pacientes.add(paciente);
        return paciente;
    }

    public void actualizar(Paciente paciente) {
        for (int i = 0; i < FiCitasDB.pacientes.size(); i++) {
            if (FiCitasDB.pacientes.get(i).getId() == paciente.getId()) {
                FiCitasDB.pacientes.set(i, paciente);
                return;
            }
        }
    }
}
