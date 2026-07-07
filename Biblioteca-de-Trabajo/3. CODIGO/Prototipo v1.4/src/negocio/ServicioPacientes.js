import { Paciente } from '../modelos/Paciente.js';

export class ServicioPacientes {
  constructor() {
    this.pacientes = [];
  }

  obtenerPacientes() {
    return this.pacientes;
  }

  registrarPaciente(cedula, nombre, telefono, fecha, domicilio, ocupacion, estadoCivil, edad) {
    const paciente = new Paciente({ id: Date.now(), cedula, nombre, telefono, fechaNacimiento: fecha, domicilio, ocupacion, estadoCivil, estado: 'Activo' });
    this.pacientes.push(paciente);
    return { exito: true, mensaje: 'Paciente registrado', paciente };
  }

  modificarPaciente(id, domicilio, telefono, ocupacion, estadoCivil) {
    const paciente = this.pacientes.find((item) => item.id === id);
    if (!paciente) {
      return { exito: false, mensaje: 'Paciente no encontrado' };
    }
    paciente.domicilio = domicilio;
    paciente.telefono = telefono;
    paciente.ocupacion = ocupacion;
    paciente.estadoCivil = estadoCivil;
    return { exito: true, mensaje: 'Paciente actualizado', paciente };
  }

  cambiarEstado(id, nuevoEstado) {
    const paciente = this.pacientes.find((item) => item.id === id);
    if (!paciente) {
      return { exito: false, mensaje: 'Paciente no encontrado' };
    }
    paciente.estado = nuevoEstado;
    return { exito: true, mensaje: 'Estado actualizado', paciente };
  }
}
