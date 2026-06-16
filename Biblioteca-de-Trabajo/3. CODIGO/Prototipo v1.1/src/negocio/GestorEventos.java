package negocio;

import java.util.ArrayList;
import java.util.List;

public class GestorEventos {
    private List<IObservadorAuditoria> observadores = new ArrayList<>();

    public void suscribir(IObservadorAuditoria obs) {
        observadores.add(obs);
    }

    public void notificar(String usuarioId, String rol, String accion, String detalles) {
        for (IObservadorAuditoria obs : observadores) {
            obs.registrar(usuarioId, rol, accion, detalles);
        }
    }
}
