import { obtenerJSON, enviarJSON } from './apiCliente.js';

export class AuditoriaRepo {
  async listar() {
    return obtenerJSON('/api/auditoria');
  }

  async guardar(item) {
    return enviarJSON('/api/auditoria', 'POST', item);
  }
}
