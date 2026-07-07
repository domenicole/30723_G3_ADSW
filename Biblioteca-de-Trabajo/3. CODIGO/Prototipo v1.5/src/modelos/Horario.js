export class Horario {
  constructor({ id, fecha, horaInicio, horaFin, cupo, estado = 'Activo', consultorioId = null, fisioterapeuta = '', citasAsignadas = 0 }) {
    this.id = id;
    this.fecha = fecha;
    this.horaInicio = horaInicio;
    this.horaFin = horaFin;
    this.cupo = cupo;
    this.estado = estado;
    this.consultorioId = consultorioId;
    this.fisioterapeuta = fisioterapeuta;
    this.citasAsignadas = citasAsignadas;
  }
}
