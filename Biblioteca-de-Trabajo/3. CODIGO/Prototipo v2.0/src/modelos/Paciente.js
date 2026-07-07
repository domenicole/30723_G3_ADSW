export class Paciente {
  constructor({ id, cedula, nombre, telefono, correo, canalPreferido, fechaNacimiento, domicilio, ocupacion, estadoCivil, estado }) {
    this.id = id;
    this.cedula = cedula;
    this.nombre = nombre;
    this.telefono = telefono;
    this.correo = correo;
    this.canalPreferido = canalPreferido || 'Correo';
    this.fechaNacimiento = fechaNacimiento;
    this.domicilio = domicilio;
    this.ocupacion = ocupacion;
    this.estadoCivil = estadoCivil;
    this.estado = estado;
  }
}
