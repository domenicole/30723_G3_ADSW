export class CitaRepo {
  constructor() {
    this.items = [];
  }

  listar() {
    return this.items;
  }

  guardar(cita) {
    this.items.push(cita);
  }
}
