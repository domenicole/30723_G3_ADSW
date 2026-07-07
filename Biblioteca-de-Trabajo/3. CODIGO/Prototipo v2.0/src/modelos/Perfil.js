export class Perfil {
  constructor({ id, nombre, descripcion, estado, permisos }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.estado = estado;
    this.permisos = permisos;
  }
}
