package modelos;

public class Cita {
    private int id;
    private int pacienteId;
    private String servicio;
    private String consultorio;
    private String fecha;
    private String hora;
    private int duracion;
    private String codigo;
    private String estado;
    private String motivoCancelacion;
    
    public Cita(int id, int pacienteId, String servicio, String consultorio, String fecha, String hora, int duracion, String codigo, String estado) {
        this.id = id;
        this.pacienteId = pacienteId;
        this.servicio = servicio;
        this.consultorio = consultorio;
        this.fecha = fecha;
        this.hora = hora;
        this.duracion = duracion;
        this.codigo = codigo;
        this.estado = estado;
        this.motivoCancelacion = "";
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public int getPacienteId() { return pacienteId; }
    public void setPacienteId(int pacienteId) { this.pacienteId = pacienteId; }
    
    public String getServicio() { return servicio; }
    public void setServicio(String servicio) { this.servicio = servicio; }

    public String getConsultorio() { return consultorio; }
    public void setConsultorio(String consultorio) { this.consultorio = consultorio; }

    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }
    
    public String getHora() { return hora; }
    public void setHora(String hora) { this.hora = hora; }
    
    public int getDuracion() { return duracion; }
    public void setDuracion(int duracion) { this.duracion = duracion; }
    
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public String getMotivoCancelacion() { return motivoCancelacion; }
    public void setMotivoCancelacion(String motivoCancelacion) { this.motivoCancelacion = motivoCancelacion; }
}
