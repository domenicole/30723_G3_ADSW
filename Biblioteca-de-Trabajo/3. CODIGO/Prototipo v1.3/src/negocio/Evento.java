package negocio;

// TODO: Objeto de valor para encapsular eventos de auditoría (Sprint 3 req)
public class Evento {
    private String accion;
    private String usuarioId;
    private String rol;
    private String detalles;

    public Evento(String accion, String usuarioId, String rol, String detalles) {
        this.accion = accion;
        this.usuarioId = usuarioId;
        this.rol = rol;
        this.detalles = detalles;
    }

    public String getAccion() { return accion; }
    public String getUsuarioId() { return usuarioId; }
    public String getRol() { return rol; }
    public String getDetalles() { return detalles; }
}
