export class AuditoriaRepo {
  constructor() {
    this.items = [];
  }

  listar() {
    return this.items;
  }

  guardar(item) {
    this.items.push(item);
    return item;
  }
}
