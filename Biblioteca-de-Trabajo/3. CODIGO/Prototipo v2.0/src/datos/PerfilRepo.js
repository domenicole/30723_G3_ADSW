import { obtenerJSON, enviarJSON } from './apiCliente.js';

export class PerfilRepo {
  async listar() {
    return obtenerJSON('/api/perfiles');
  }

  async guardar(perfil) {
    return enviarJSON('/api/perfiles', 'POST', perfil);
  }

  async actualizar(id, cambios) {
    return enviarJSON(`/api/perfiles/${id}`, 'PATCH', cambios);
  }
}
