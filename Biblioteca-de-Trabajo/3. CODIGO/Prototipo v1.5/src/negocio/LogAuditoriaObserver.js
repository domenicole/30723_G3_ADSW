import { IObservadorAuditoria } from './IObservadorAuditoria.js';

export class LogAuditoriaObserver extends IObservadorAuditoria {
  actualizar(evento) {
    console.log('Auditoría:', evento.tipo, evento.datos);
  }
}
