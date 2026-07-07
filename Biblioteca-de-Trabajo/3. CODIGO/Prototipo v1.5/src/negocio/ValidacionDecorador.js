export class ValidacionDecorador {
  constructor(servicioBase) {
    this.servicioBase = servicioBase;
  }

  obtenerPacientes() {
    return this.servicioBase.obtenerPacientes();
  }

  registrarPaciente(cedula, nombre, telefono, fecha, domicilio, ocupacion, estadoCivil, edad) {
    return this.servicioBase.registrarPaciente(cedula, nombre, telefono, fecha, domicilio, ocupacion, estadoCivil, edad);
  }

  modificarPaciente(id, domicilio, telefono, ocupacion, estadoCivil) {
    return this.servicioBase.modificarPaciente(id, domicilio, telefono, ocupacion, estadoCivil);
  }

  cambiarEstado(id, nuevoEstado) {
    return this.servicioBase.cambiarEstado(id, nuevoEstado);
  }
}
