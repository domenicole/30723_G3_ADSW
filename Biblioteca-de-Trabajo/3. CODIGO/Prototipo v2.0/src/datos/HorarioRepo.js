export class HorarioRepo {
  constructor() {
    this.items = [];
  }

  listar() {
    return this.items;
  }

  guardar(horario) {
    this.items.push(horario);
  }

  actualizar(id, cambios) {
    const horario = this.items.find((item) => item.id === id);
    if (horario) Object.assign(horario, cambios);
  }

  eliminar(id) {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
