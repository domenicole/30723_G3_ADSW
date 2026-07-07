import { obtenerJSON, enviarJSON } from './apiCliente.js';

export class PacienteRepo {
  async listar() {
    return obtenerJSON('/api/pacientes');
  }

  async guardar(paciente) {
    return enviarJSON('/api/pacientes', 'POST', paciente);
  }

  async actualizar(id, cambios) {
    return enviarJSON(`/api/pacientes/${id}`, 'PATCH', cambios);
  }

  async obtenerPorId(id) {
    return obtenerJSON(`/api/pacientes/${id}`);
  }
}
