export class Usuario {
  constructor({ id, correo, password, perfilId, estado }) {
    this.id = id;
    this.correo = correo;
    this.password = password;
    this.perfilId = perfilId;
    this.estado = estado;
  }
}
