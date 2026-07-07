export class PerfilRepo {
  constructor() {
    this.items = [];
  }

  listar() {
    return this.items;
  }

  guardar(perfil) {
    this.items.push(perfil);
  }
}
