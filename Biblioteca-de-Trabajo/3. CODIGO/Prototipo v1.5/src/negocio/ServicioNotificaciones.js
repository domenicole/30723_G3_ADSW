import { NotificacionRepo } from '../datos/NotificacionRepo.js';

export class ServicioNotificaciones {
  constructor(gestor, notificacionRepo) {
    this.gestor = gestor;
    this.notificacionRepo = notificacionRepo || new NotificacionRepo();
  }

  enviar({ destinatario, canal, mensaje, citaId, pacienteId }) {
    const fechaHora = new Date().toISOString();
    const estado = 'Enviado';
    const registro = {
      id: Date.now(),
      destinatario,
      canal,
      mensaje,
      citaId,
      pacienteId,
      fechaHora,
      estado,
    };

    this.notificacionRepo.guardar(registro);
    this.gestor?.notificar?.({ tipo: 'NOTIFICACION_REGISTRADA', datos: registro });
    return { exito: true, mensaje: 'Notificación simulada enviada', registro };
  }

  registrarPendiente({ destinatario, canal, mensaje, citaId, pacienteId, motivo }) {
    const fechaHora = new Date().toISOString();
    const registro = {
      id: Date.now(),
      destinatario,
      canal,
      mensaje,
      citaId,
      pacienteId,
      fechaHora,
      estado: 'Pendiente',
      motivo,
    };
    this.notificacionRepo.guardar(registro);
    this.gestor?.notificar?.({ tipo: 'NOTIFICACION_PENDIENTE', datos: registro });
    return { exito: false, mensaje: motivo, registro };
  }
}
