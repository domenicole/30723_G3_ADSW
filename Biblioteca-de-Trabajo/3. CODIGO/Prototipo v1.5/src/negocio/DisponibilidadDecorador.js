export class DisponibilidadDecorador {
  constructor(servicioBase) {
    this.servicioBase = servicioBase;
  }

  obtenerTodas() {
    return this.servicioBase.obtenerTodas();
  }

  registrarCita(pacienteId, servicio, consultorio, fecha, hora, duracion) {
    return this.servicioBase.registrarCita(pacienteId, servicio, consultorio, fecha, hora, duracion);
  }

  cancelarCita(id, motivo) {
    return this.servicioBase.cancelarCita(id, motivo);
  }

  reprogramarCita(id, fecha, hora) {
    return this.servicioBase.reprogramarCita(id, fecha, hora);
  }
}
