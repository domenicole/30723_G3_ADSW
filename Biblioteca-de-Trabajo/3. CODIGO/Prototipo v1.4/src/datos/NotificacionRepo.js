export class NotificacionRepo {
  constructor() {
    this.items = [];
  }

  guardar(item) {
    this.items.push(item);
  }
}
