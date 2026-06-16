package negocio;

public interface IObservadorAuditoria {
    void registrar(String usuarioId, String rol, String accion, String detalles);
}
