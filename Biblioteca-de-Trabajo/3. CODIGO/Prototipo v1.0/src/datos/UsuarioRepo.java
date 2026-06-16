package datos;

import modelos.Usuario;
import java.util.ArrayList;
import java.util.List;

public class UsuarioRepo {
    public Usuario obtenerPorCorreo(String correo) {
        for (Usuario u : FiCitasDB.usuarios) {
            if (u.getCorreo().equals(correo)) {
                return u;
            }
        }
        return null;
    }

    public List<Usuario> obtenerPorPerfil(int perfilId) {
        List<Usuario> filtrados = new ArrayList<>();
        for (Usuario u : FiCitasDB.usuarios) {
            if (u.getPerfilId() == perfilId) {
                filtrados.add(u);
            }
        }
        return filtrados;
    }

    public void actualizar(Usuario usuario) {
        for (int i = 0; i < FiCitasDB.usuarios.size(); i++) {
            if (FiCitasDB.usuarios.get(i).getId() == usuario.getId()) {
                FiCitasDB.usuarios.set(i, usuario);
                return;
            }
        }
    }
}
