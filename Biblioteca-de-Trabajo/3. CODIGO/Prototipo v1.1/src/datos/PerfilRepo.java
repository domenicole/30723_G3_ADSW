package datos;

import modelos.Perfil;
import java.util.ArrayList;
import java.util.List;

public class PerfilRepo {
    public List<Perfil> obtenerTodos() {
        return new ArrayList<>(FiCitasDB.perfiles);
    }

    public Perfil obtenerPorId(int id) {
        for (Perfil p : FiCitasDB.perfiles) {
            if (p.getId() == id) {
                return p;
            }
        }
        return null;
    }

    public Perfil crear(Perfil perfil) {
        int maxId = 0;
        for (Perfil p : FiCitasDB.perfiles) {
            if (p.getId() > maxId) maxId = p.getId();
        }
        perfil.setId(maxId + 1);
        FiCitasDB.perfiles.add(perfil);
        return perfil;
    }

    public void actualizar(Perfil perfil) {
        for (int i = 0; i < FiCitasDB.perfiles.size(); i++) {
            if (FiCitasDB.perfiles.get(i).getId() == perfil.getId()) {
                FiCitasDB.perfiles.set(i, perfil);
                return;
            }
        }
    }
}
