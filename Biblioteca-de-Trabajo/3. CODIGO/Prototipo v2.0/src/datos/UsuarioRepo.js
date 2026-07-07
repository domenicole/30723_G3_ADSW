import { obtenerJSON, enviarJSON } from './apiCliente.js';

export class UsuarioRepo {
  async listar() {
    return obtenerJSON('/api/usuarios');
  }

  async guardar(usuario) {
    return enviarJSON('/api/usuarios', 'POST', usuario);
  }

  async login(correo, password) {
    return enviarJSON('/api/usuarios/login', 'POST', { correo, password });
  }
}
