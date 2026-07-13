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
      id: Date.now(),
      usuario: datos.usuario?.correo || datos.usuario?.nombre || datos.usuario || 'Sistema',
      rol: datos.perfil?.nombre || datos.rol || 'Sistema',
      fecha: ahora.toISOString().slice(0, 10),
      hora: ahora.toTimeString().slice(0, 8),
      accion: evento.tipo,
      datosAnteriores: datos.anteriores ?? null,
      datosModificados: datos.modificados ?? datos.nuevos ?? datos.actuales ?? null,
    };

    this.auditoriaRepo.guardar(registro);
    console.log('Auditoría:', registro);
  }
}
