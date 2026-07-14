export class Cita {
  constructor({ id, pacienteId, servicio, consultorio, fecha, hora, duracion, estado, fisioterapeuta = '' }) {
    this.id = id;
    this.pacienteId = pacienteId;
    this.servicio = servicio;
    this.consultorio = consultorio;
    this.fecha = fecha;
    this.hora = hora;
    this.duracion = duracion;
    this.estado = estado;
    this.fisioterapeuta = fisioterapeuta;
  }
}
