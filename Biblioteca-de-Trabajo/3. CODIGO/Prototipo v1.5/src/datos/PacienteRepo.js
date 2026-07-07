export class PacienteRepo {
  constructor() {
    this.items = [];
  }

  listar() {
    return this.items;
  }

  guardar(paciente) {
    this.items.push(paciente);
  }

  actualizar(id, cambios) {
    const paciente = this.items.find((item) => item.id === Number(id));
    if (!paciente) {
      return null;
    }
    Object.assign(paciente, cambios);
    return paciente;
  }

  obtenerPorId(id) {
    return this.items.find((item) => item.id === Number(id));
  }
}
