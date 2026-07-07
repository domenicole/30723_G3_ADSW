export class ServicioNotificaciones {
  constructor(gestor) {
    this.gestor = gestor;
  }

  enviar(mensaje, canal) {
    this.gestor.notificar({ tipo: 'NOTIFICACION', datos: { mensaje, canal } });
    return { exito: true, mensaje: 'Notificación enviada' };
  }
}
