package datos;

import modelos.Auditoria;

public class AuditoriaRepo {
    public void registrar(Auditoria auditoria) {
        int maxId = 0;
        for (Auditoria a : FiCitasDB.auditorias) {
            if (a.getId() > maxId) maxId = a.getId();
        }
        FiCitasDB.auditorias.add(new Auditoria(maxId + 1, auditoria.getFechaHora(), auditoria.getUsuarioId(), auditoria.getRol(), auditoria.getAccion(), auditoria.getDetalles()));
    }
}
