import { Cita } from '../modelos/Cita.js';

export class ServicioCitas {
  constructor(gestor, usuarioId) {
    this.gestor = gestor;
    this.usuarioId = usuarioId;
    this.citas = [];
  }

  obtenerTodas() {
    return this.citas;
  }

  registrarCita(pacienteId, servicio, consultorio, fecha, hora, duracion) {
    const cita = new Cita({ id: Date.now(), pacienteId, servicio, consultorio, fecha, hora, duracion, estado: 'Programada' });
    this.citas.push(cita);
    this.gestor.notificar({ tipo: 'CITA_REGISTRADA', datos: cita });
    return { exito: true, mensaje: 'Cita registrada', cita };
  }

  cancelarCita(id, motivo) {
    const cita = this.citas.find((item) => item.id === Number(id));
    if (!cita) {
      return { exito: false, mensaje: 'Cita no encontrada' };
    }
    cita.estado = 'Cancelada';
    cita.motivoCancelacion = motivo;
    this.gestor.notificar({ tipo: 'CITA_CANCELADA', datos: cita });
    return { exito: true, mensaje: 'Cita cancelada', cita };
  }

  reprogramarCita(id, fecha, hora) {
    const cita = this.citas.find((item) => item.id === Number(id));
    if (!cita) {
      return { exito: false, mensaje: 'Cita no encontrada' };
    }
    cita.fecha = fecha;
    cita.hora = hora;
    cita.estado = 'Reprogramada';
    this.gestor.notificar({ tipo: 'CITA_REPROGRAMADA', datos: cita });
    return { exito: true, mensaje: 'Cita reprogramada', cita };
  }
}
