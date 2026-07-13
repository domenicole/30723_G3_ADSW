import { Paciente } from '../modelos/Paciente.js';
import { PacienteRepo } from '../datos/PacienteRepo.js';

export class ServicioPacientes {
  constructor(pacienteRepo) {
    this.pacienteRepo = pacienteRepo || new PacienteRepo();
  }

  async obtenerPacientes() {
    return this.pacienteRepo.listar();
  }

  async obtenerPacientePorId(id) {
    return this.pacienteRepo.obtenerPorId(id);
  }

  async registrarPaciente(cedula, nombre, sexo, telefono, correo, canalPreferido, fecha, domicilio, ocupacion, estadoCivil) {
    const paciente = new Paciente({
      id: Date.now(),
      cedula,
      nombre,
      sexo,
      telefono,
      correo,
      canalPreferido,
      fechaNacimiento: fecha,
      domicilio,
      ocupacion,
      estadoCivil,
      estado: 'Activo'
    });
    await this.pacienteRepo.guardar(paciente);
    return { exito: true, mensaje: 'Paciente registrado', paciente };
  }

  async modificarPaciente(id, domicilio, telefono, correo, canalPreferido, ocupacion, estadoCivil) {
    const paciente = await this.pacienteRepo.actualizar(id, { domicilio, telefono, correo, canalPreferido, ocupacion, estadoCivil });
    if (!paciente) {
      return { exito: false, mensaje: 'Paciente no encontrado' };
    }
    return { exito: true, mensaje: 'Paciente actualizado', paciente };
  }

  async cambiarEstado(id, nuevoEstado) {
    const paciente = await this.pacienteRepo.actualizar(id, { estado: nuevoEstado });
    if (!paciente) {
      return { exito: false, mensaje: 'Paciente no encontrado' };
    }
    return { exito: true, mensaje: 'Estado actualizado', paciente };
  }
}
