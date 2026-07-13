import { Cita } from '../modelos/Cita.js';
import { CitaRepo } from '../datos/CitaRepo.js';

export class ServicioCitas {
  constructor(gestor, usuarioId, citaRepo) {
    this.gestor = gestor;
    this.usuarioId = usuarioId;
    this.citaRepo = citaRepo || new CitaRepo();
  }

  async obtenerTodas() {
    return this.citaRepo.listar();
  }

  async registrarCita(pacienteId, servicio, consultorio, fecha, hora, duracion, fisioterapeuta) {
    const cita = new Cita({ id: Date.now(), pacienteId, servicio, consultorio, fecha, hora, duracion, fisioterapeuta, estado: 'Programada' });
    await this.citaRepo.guardar(cita);
    this.gestor.notificar({ tipo: 'CITA_REGISTRADA', datos: cita });
    return { exito: true, mensaje: 'Cita registrada', cita };
  }

  async cancelarCita(id, motivo) {
    const cita = await this.citaRepo.actualizar(id, { estado: 'Cancelada', motivoCancelacion: motivo });
    if (!cita) {
      return { exito: false, mensaje: 'Cita no encontrada' };
    }
    this.gestor.notificar({ tipo: 'CITA_CANCELADA', datos: cita });
    return { exito: true, mensaje: 'Cita cancelada', cita };
  }

  async reprogramarCita(id, fecha, hora, servicio, consultorio, fisioterapeuta) {
    const citaActual = await this.citaRepo.obtenerPorId(id);
    if (!citaActual) {
      return { exito: false, mensaje: 'Cita no encontrada' };
    }
    
    const update = { 
      fecha, 
      hora, 
      estado: 'Reprogramada',
      servicio: servicio || citaActual.servicio,
      consultorio: consultorio || citaActual.consultorio,
      fisioterapeuta: fisioterapeuta || citaActual.fisioterapeuta
    };

    const cita = await this.citaRepo.actualizar(id, update);
    this.gestor.notificar({ tipo: 'CITA_REPROGRAMADA', datos: cita });
    return { exito: true, mensaje: 'Cita reprogramada', cita };
  }
}
