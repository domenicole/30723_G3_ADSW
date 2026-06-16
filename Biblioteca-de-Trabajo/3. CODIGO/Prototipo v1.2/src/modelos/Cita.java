package modelos;

// TODO: Representa una cita médica programada en el sistema.
public class Cita {
    private int id;
    private int pacienteId;
    private String fecha;
    private String hora;
    private String estado;
    
    public Cita(int id, int pacienteId, String fecha, String hora, String estado) {
        this.id = id;
        this.pacienteId = pacienteId;
        this.fecha = fecha;
        this.hora = hora;
        this.estado = estado;
    }

    public int getId() { return id; }
    public int getPacienteId() { return pacienteId; }
    public String getFecha() { return fecha; }
    public String getHora() { return hora; }
    public String getEstado() { return estado; }
}
