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
}
