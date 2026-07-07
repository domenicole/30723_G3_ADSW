export class GestorEventos {
  constructor() {
    this.observadores = [];
  }

  suscribir(observer) {
    this.observadores.push(observer);
  }

  notificar(evento) {
    this.observadores.forEach((obs) => obs.actualizar(evento));
  }
}
