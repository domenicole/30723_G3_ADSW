import { NotificacionRepo } from '../datos/NotificacionRepo.js';
import { CanalEmail } from './strategy/CanalEmail.js';
import { CanalWhatsApp } from './strategy/CanalWhatsApp.js';

export class ServicioNotificaciones {
  constructor(gestor, notificacionRepo) {
    this.gestor = gestor;
    this.notificacionRepo = notificacionRepo || new NotificacionRepo();
    this.estrategias = {
      'Correo': new CanalEmail(),
      'WhatsApp': new CanalWhatsApp()
    };
  }

  enviar({ destinatario, canal, mensaje, citaId, pacienteId }) {
    const estrategia = this.estrategias[canal];
    if (!estrategia) {
      return this.registrarPendiente({ destinatario, canal, mensaje, citaId, pacienteId, motivo: 'Canal no soportado' });
    }

    try {
      const enviadoExitosamente = estrategia.enviar(mensaje);
      
      const fechaHora = new Date().toISOString();
      const estado = enviadoExitosamente ? 'Enviado' : 'Fallido';
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
      return { exito: enviadoExitosamente, mensaje: enviadoExitosamente ? 'Notificación enviada' : 'Fallo al enviar notificación', registro };
    } catch (e) {
      return this.registrarPendiente({ destinatario, canal, mensaje, citaId, pacienteId, motivo: e.message || 'Error desconocido' });
    }
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
