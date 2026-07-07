export class AuditoriaRepo {
  constructor() {
    this.items = [];
  }

  guardar(item) {
    this.items.push(item);
  }
}
