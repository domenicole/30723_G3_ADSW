import { obtenerJSON, enviarJSON } from './apiCliente.js';

export class CitaRepo {
  async listar() {
    return obtenerJSON('/api/citas');
  }

  async guardar(cita) {
    return enviarJSON('/api/citas', 'POST', cita);
  }

  async actualizar(id, cambios) {
    return enviarJSON(`/api/citas/${id}`, 'PATCH', cambios);
  }

  async obtenerPorId(id) {
    return obtenerJSON(`/api/citas/${id}`);
  }
}
