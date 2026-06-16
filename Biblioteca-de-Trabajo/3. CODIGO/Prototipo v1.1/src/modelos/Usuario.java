package modelos;

public class Usuario {
    private int id;
    private String correo;
    private String contrasena;
    private int perfilId;
    private String estado;
    private int intentosFallidos;

    public Usuario(int id, String correo, String contrasena, int perfilId, String estado) {
        this.id = id;
        this.correo = correo;
        this.contrasena = contrasena;
        this.perfilId = perfilId;
        this.estado = estado;
        this.intentosFallidos = 0;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }
    public int getPerfilId() { return perfilId; }
    public void setPerfilId(int perfilId) { this.perfilId = perfilId; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public int getIntentosFallidos() { return intentosFallidos; }
    public void setIntentosFallidos(int intentosFallidos) { this.intentosFallidos = intentosFallidos; }
}
