export class Notificacion {
  constructor({ id, destinatario, canal, mensaje, fechaHora, estado, citaId, pacienteId, motivo }) {
    this.id = id;
    this.destinatario = destinatario;
    this.canal = canal;
    this.mensaje = mensaje;
    this.fechaHora = fechaHora;
    this.estado = estado;
    this.citaId = citaId;
    this.pacienteId = pacienteId;
    this.motivo = motivo;
  }
}
