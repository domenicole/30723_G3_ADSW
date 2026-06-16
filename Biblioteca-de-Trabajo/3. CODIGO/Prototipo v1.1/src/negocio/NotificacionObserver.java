package negocio;

// TODO: Observer para notificaciones
public class NotificacionObserver implements IObservadorAuditoria {
    @Override
    public void registrar(String usuarioId, String rol, String accion, String detalles) {
        // Implementación futura para disparar notificaciones
    }
}
