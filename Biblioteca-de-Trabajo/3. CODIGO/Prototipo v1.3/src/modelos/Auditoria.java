package modelos;

public class Auditoria {
    private int id;
    private String fechaHora;
    private String usuarioId;
    private String rol;
    private String accion;
    private String detalles;

    public Auditoria(int id, String fechaHora, String usuarioId, String rol, String accion, String detalles) {
        this.id = id;
        this.fechaHora = fechaHora;
        this.usuarioId = usuarioId;
        this.rol = rol;
        this.accion = accion;
        this.detalles = detalles;
    }

    public int getId() { return id; }
    public String getFechaHora() { return fechaHora; }
    public String getUsuarioId() { return usuarioId; }
    public String getRol() { return rol; }
    public String getAccion() { return accion; }
    public String getDetalles() { return detalles; }
}
