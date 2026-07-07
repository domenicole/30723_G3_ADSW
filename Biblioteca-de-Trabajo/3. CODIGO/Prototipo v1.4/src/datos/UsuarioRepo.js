export class UsuarioRepo {
  constructor() {
    this.items = [];
  }

  listar() {
    return this.items;
  }

  guardar(usuario) {
    this.items.push(usuario);
  }
}
