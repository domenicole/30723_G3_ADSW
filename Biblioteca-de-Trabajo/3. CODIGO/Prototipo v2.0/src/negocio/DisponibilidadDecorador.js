const DURACION_MAXIMA_MINUTOS = 120;

function combinarFechaHora(fecha, hora) {
  return new Date(`${fecha}T${hora}:00`);
}

function haySolapamiento(citas, consultorio, fecha, hora, duracionMinutos, idExcluir) {
  const inicioNueva = combinarFechaHora(fecha, hora);
  const finNueva = new Date(inicioNueva.getTime() + duracionMinutos * 60000);

  return citas.some((cita) => {
    if (cita.id === idExcluir) return false;
    if (cita.estado === 'Cancelada') return false;
    if (cita.consultorio !== consultorio || cita.fecha !== fecha) return false;

    const inicioExistente = combinarFechaHora(cita.fecha, cita.hora);
    const finExistente = new Date(inicioExistente.getTime() + Number(cita.duracion) * 60000);
    return inicioExistente < finNueva && inicioNueva < finExistente;
  });
}

export class DisponibilidadDecorador {
  constructor(servicioBase, pacienteRepo) {
    this.servicioBase = servicioBase;
    this.pacienteRepo = pacienteRepo;
  }

  async obtenerTodas() {
    return this.servicioBase.obtenerTodas();
  }

  async registrarCita(pacienteId, servicio, consultorio, fecha, hora, duracion, fisioterapeuta) {
    if (this.pacienteRepo) {
      const pacientes = await this.pacienteRepo.listar();
      const paciente = pacientes.find(p => p.cedula === pacienteId);
      if (!paciente) {
        return { exito: false, mensaje: 'No existe un paciente registrado con esa cédula' };
      }
      if (paciente.estado !== 'Activo') {
        return { exito: false, mensaje: 'El paciente no está activo. No se pueden agendar citas.' };
      }
    }

    const duracionMinutos = Number(duracion);
    if (!Number.isFinite(duracionMinutos) || duracionMinutos <= 0) {
      return { exito: false, mensaje: 'La duración de la cita no es válida' };
    }
    if (duracionMinutos > DURACION_MAXIMA_MINUTOS) {
      return { exito: false, mensaje: 'Una cita no puede durar más de 2 horas' };
    }

    const inicio = combinarFechaHora(fecha, hora);
    if (Number.isNaN(inicio.getTime()) || inicio < new Date()) {
      return { exito: false, mensaje: 'No se puede agendar una cita en una fecha u hora pasada' };
    }

    const citas = await this.servicioBase.obtenerTodas();
    if (haySolapamiento(citas, consultorio, fecha, hora, duracionMinutos)) {
      return { exito: false, mensaje: 'El consultorio ya tiene una cita agendada en ese horario' };
    }

    return this.servicioBase.registrarCita(pacienteId, servicio, consultorio, fecha, hora, duracionMinutos, fisioterapeuta);
  }

  async cancelarCita(id, motivo) {
    return this.servicioBase.cancelarCita(id, motivo);
  }

  async reprogramarCita(id, fecha, hora, servicio, consultorio, fisioterapeuta) {
    const inicio = combinarFechaHora(fecha, hora);
    if (Number.isNaN(inicio.getTime()) || inicio < new Date()) {
      return { exito: false, mensaje: 'No se puede reprogramar una cita a una fecha u hora pasada' };
    }

    const citas = await this.servicioBase.obtenerTodas();
    const citaActual = citas.find((c) => c.id === Number(id));
    if (!citaActual) {
      return { exito: false, mensaje: 'Cita no encontrada' };
    }

    const nuevoConsultorio = consultorio || citaActual.consultorio;
    if (haySolapamiento(citas, nuevoConsultorio, fecha, hora, Number(citaActual.duracion), citaActual.id)) {
      return { exito: false, mensaje: 'El consultorio ya tiene una cita agendada en ese horario' };
    }

    return this.servicioBase.reprogramarCita(id, fecha, hora, servicio, consultorio, fisioterapeuta);
  }
}
