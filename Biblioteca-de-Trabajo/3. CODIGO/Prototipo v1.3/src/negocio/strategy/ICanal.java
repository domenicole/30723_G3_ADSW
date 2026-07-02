package negocio.strategy;

// TODO: Interfaz para envío de notificaciones
public interface ICanal {
    void enviarMensaje(String destino, String mensaje);
}
