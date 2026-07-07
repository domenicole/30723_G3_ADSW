import { Paciente } from '../modelos/Paciente.js';
import { PacienteRepo } from '../datos/PacienteRepo.js';

export class ServicioPacientes {
  constructor(pacienteRepo) {
    this.pacienteRepo = pacienteRepo || new PacienteRepo();
    this.pacientes = this.pacienteRepo.listar();
  }

  obtenerPacientes() {
    return this.pacienteRepo.listar();
  }

  obtenerPacientePorId(id) {
    return this.pacienteRepo.obtenerPorId(id);
  }

  registrarPaciente(cedula, nombre, telefono, correo, canalPreferido, fecha, domicilio, ocupacion, estadoCivil) {
    const paciente = new Paciente({
      id: Date.now(),
      cedula,
      nombre,
      telefono,
      correo,
      canalPreferido,
      fechaNacimiento: fecha,
      domicilio,
      ocupacion,
      estadoCivil,
      estado: 'Activo'
    });
    this.pacienteRepo.guardar(paciente);
    return { exito: true, mensaje: 'Paciente registrado', paciente };
  }

  modificarPaciente(id, domicilio, telefono, correo, canalPreferido, ocupacion, estadoCivil) {
    const paciente = this.pacienteRepo.actualizar(id, { domicilio, telefono, correo, canalPreferido, ocupacion, estadoCivil });
    if (!paciente) {
      return { exito: false, mensaje: 'Paciente no encontrado' };
    }
    return { exito: true, mensaje: 'Paciente actualizado', paciente };
  }

  cambiarEstado(id, nuevoEstado) {
    const paciente = this.pacienteRepo.actualizar(id, { estado: nuevoEstado });
    if (!paciente) {
      return { exito: false, mensaje: 'Paciente no encontrado' };
    }
    return { exito: true, mensaje: 'Estado actualizado', paciente };
  }
}
