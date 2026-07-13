import { IObservadorAuditoria } from './IObservadorAuditoria.js';
import { AuditoriaRepo } from '../datos/AuditoriaRepo.js';

export class LogAuditoriaObserver extends IObservadorAuditoria {
  constructor(auditoriaRepo) {
    super();
    this.auditoriaRepo = auditoriaRepo || (typeof window !== 'undefined' ? window.appState?.auditoriaRepo : null) || new AuditoriaRepo();
  }

  actualizar(evento) {
    if (!evento || !evento.tipo) return;

    const ahora = new Date();
    const datos = evento.datos || {};
    const registro = {
      usuarioId: datos.usuario?.id || datos.usuario?._id || 'Sistema',
      perfilNombre: datos.perfil?.nombre || datos.rol || 'Desconocido',
      accion: evento.tipo,
      datosAnteriores: datos.anteriores ?? null,
      datosNuevos: datos.modificados ?? datos.nuevos ?? datos.actuales ?? null,
      fecha: ahora.toISOString()
    };

    this.auditoriaRepo.guardar(registro);
    console.log('Auditoría:', registro);
  }
}
