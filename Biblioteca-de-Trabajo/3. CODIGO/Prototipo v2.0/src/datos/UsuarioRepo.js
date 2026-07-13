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

  async solicitarRecuperacion(correo) {
    return enviarJSON('/api/usuarios/recovery/request', 'POST', { correo });
  }

  async verificarCodigoRecuperacion(correo, codigo) {
    return enviarJSON('/api/usuarios/recovery/verify', 'POST', { correo, codigo });
  }

  async cambiarContrasena(correo, codigo, nuevaContrasena) {
    return enviarJSON('/api/usuarios/recovery/change', 'POST', { correo, codigo, nuevaContrasena });
  }
}
