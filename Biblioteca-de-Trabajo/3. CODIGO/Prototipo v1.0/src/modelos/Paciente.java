package modelos;

public class Paciente {
    private int id;
    private String cedula;
    private String nombre;
    private String telefono;
    private String fechaNacimiento;
    private String domicilio;
    private String ocupacion;
    private String estadoCivil;
    private String estado;

    public Paciente(int id, String cedula, String nombre, String telefono, String fechaNacimiento, String domicilio, String ocupacion, String estadoCivil, String estado) {
        this.id = id;
        this.cedula = cedula;
        this.nombre = nombre;
        this.telefono = telefono;
        this.fechaNacimiento = fechaNacimiento;
        this.domicilio = domicilio;
        this.ocupacion = ocupacion;
        this.estadoCivil = estadoCivil;
        this.estado = estado;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getCedula() { return cedula; }
    public void setCedula(String cedula) { this.cedula = cedula; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(String fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }
    public String getDomicilio() { return domicilio; }
    public void setDomicilio(String domicilio) { this.domicilio = domicilio; }
    public String getOcupacion() { return ocupacion; }
    public void setOcupacion(String ocupacion) { this.ocupacion = ocupacion; }
    public String getEstadoCivil() { return estadoCivil; }
    public void setEstadoCivil(String estadoCivil) { this.estadoCivil = estadoCivil; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
