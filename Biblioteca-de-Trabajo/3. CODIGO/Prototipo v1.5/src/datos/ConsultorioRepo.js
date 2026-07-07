export class ConsultorioRepo {
  constructor() {
    this.items = [];
  }

  listar() {
    return this.items;
  }

  guardar(consultorio) {
    this.items.push(consultorio);
  }

  eliminar(id) {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
