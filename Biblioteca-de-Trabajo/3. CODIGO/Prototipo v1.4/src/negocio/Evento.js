export class Evento {
  constructor(tipo, datos = {}) {
    this.tipo = tipo;
    this.datos = datos;
  }
}
