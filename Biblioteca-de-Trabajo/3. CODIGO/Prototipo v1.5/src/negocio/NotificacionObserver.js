import { ServicioNotificaciones } from './ServicioNotificaciones.js';

export class NotificacionObserver {
  constructor(gestor, pacienteRepo, notificacionRepo) {
    this.gestor = gestor;
    this.pacienteRepo = pacienteRepo;
    this.servicioNotificaciones = new ServicioNotificaciones(gestor, notificacionRepo);
  }

  actualizar(evento) {
    if (!evento || !evento.tipo) return;
    if (evento.tipo.startsWith('CITA_')) {
      this.procesarEventoCita(evento);
    }
  }

  procesarEventoCita(evento) {
    const cita = evento.datos;
    const paciente = this.pacienteRepo.obtenerPorId(cita.pacienteId);
    const mensaje = this.generarMensaje(evento.tipo, cita, paciente);
    const canal = paciente?.canalPreferido || 'Correo';
    const destinatario = canal === 'WhatsApp' ? paciente?.telefono : paciente?.correo;

    if (!paciente) {
      this.mostrarAviso('No se encontró el paciente para la cita.', 'error');
      return;
    }

    if (!destinatario) {
      const motivo = `Faltan datos de contacto para ${canal}`;
      this.servicioNotificaciones.registrarPendiente({
        destinatario: paciente.nombre,
        canal,
        mensaje,
        citaId: cita.id,
        pacienteId: paciente.id,
        motivo,
      });
      this.mostrarAviso(`Notificación pendiente: ${motivo}`, 'warning');
      return;
    }

    const resultado = this.servicioNotificaciones.enviar({
      destinatario,
      canal,
      mensaje,
      citaId: cita.id,
      pacienteId: paciente.id,
    });

    this.mostrarAviso(`Notificación enviada a ${paciente.nombre} por ${canal}: ${mensaje}`, 'success');
    return resultado;
  }

  generarMensaje(tipo, cita, paciente) {
    const accion = tipo === 'CITA_REGISTRADA' ? 'registró' : tipo === 'CITA_CANCELADA' ? 'canceló' : 'reprogramó';
    const codigo = cita.id;
    const fecha = cita.fecha || 'N/A';
    const hora = cita.hora || 'N/A';
    const servicio = cita.servicio || 'Servicio no definido';
    const estado = cita.estado || 'Desconocido';
    return `Su cita ${codigo} ha sido ${accion}. Fecha: ${fecha}, Hora: ${hora}, Servicio: ${servicio}, Estado: ${estado}.`;
  }

  mostrarAviso(mensaje, nivel = 'info') {
    const panel = document.getElementById('panelAvisos');
    if (!panel) {
      alert(mensaje);
      return;
    }
    const aviso = document.createElement('div');
    aviso.className = `aviso aviso-${nivel}`;
    aviso.textContent = mensaje;
    panel.prepend(aviso);
    setTimeout(() => aviso.remove(), 8000);
  }
}
