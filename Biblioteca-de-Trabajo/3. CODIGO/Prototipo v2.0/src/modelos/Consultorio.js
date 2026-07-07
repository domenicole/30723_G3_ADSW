export class Consultorio {
  constructor({ id, nombre, capacidad, estado = 'Activo' }) {
    this.id = id;
    this.nombre = nombre;
    this.capacidad = capacidad;
    this.estado = estado;
  }
}
