export class NotificacionRepo {
  constructor() {
    this.items = [];
  }

  listar() {
    return this.items;
  }

  guardar(item) {
    this.items.push(item);
  }

  obtenerPendientes() {
    return this.items.filter((item) => item.estado === 'Pendiente');
  }
}
