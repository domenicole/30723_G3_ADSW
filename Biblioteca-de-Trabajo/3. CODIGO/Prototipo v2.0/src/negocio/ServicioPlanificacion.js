import { Horario } from '../modelos/Horario.js';
import { Consultorio } from '../modelos/Consultorio.js';
import { Auditoria } from '../modelos/Auditoria.js';
import { HorarioRepo } from '../datos/HorarioRepo.js';
import { ConsultorioRepo } from '../datos/ConsultorioRepo.js';
import { AuditoriaRepo } from '../datos/AuditoriaRepo.js';

export class ServicioPlanificacion {
  constructor(gestor, usuario) {
    this.gestor = gestor;
    this.usuario = usuario;
    this.horariosRepo = new HorarioRepo();
    this.consultoriosRepo = new ConsultorioRepo();
    this.auditoriaRepo = new AuditoriaRepo();
    this.horarios = this.horariosRepo.listar();
    this.consultorios = this.consultoriosRepo.listar();
    this.auditoria = this.auditoriaRepo.listar();
    this.inicializarDatosBase();
  }

  inicializarDatosBase() {
    if (this.consultorios.length === 0) {
      this.consultoriosRepo.guardar(new Consultorio({ id: 1, nombre: 'Consultorio A', capacidad: 10, estado: 'Activo' }));
      this.consultoriosRepo.guardar(new Consultorio({ id: 2, nombre: 'Consultorio B', capacidad: 8, estado: 'Activo' }));
      this.consultorios = this.consultoriosRepo.listar();
    }
  }

  registrarHorario({ fecha, horaInicio, horaFin, cupo, estado = 'Activo', consultorioId = null, fisioterapeuta = '' }) {
    if (!fecha || !horaInicio || !horaFin || !cupo) {
      return { exito: false, mensaje: 'Complete todos los datos del horario' };
    }
    if (horaInicio >= horaFin) {
      return { exito: false, mensaje: 'La hora de inicio debe ser menor a la hora de fin' };
    }
    if (Number(cupo) < 1) {
      return { exito: false, mensaje: 'El cupo mínimo es 1' };
    }
    
    // Validar solapamiento
    const consultorioIdNum = Number(consultorioId);
    const solapamiento = this.horarios.some(h => {
      if (h.estado === 'Inactivo' || h.fecha !== fecha || h.consultorioId !== consultorioIdNum) return false;
      return (horaInicio < h.horaFin && horaFin > h.horaInicio);
    });

    if (solapamiento) {
      return { exito: false, mensaje: 'El consultorio ya tiene un horario que se solapa en esa franja' };
    }

    const horario = new Horario({ id: Date.now(), fecha, horaInicio, horaFin, cupo: Number(cupo), estado, consultorioId: consultorioIdNum, fisioterapeuta, citasAsignadas: 0 });
    this.horariosRepo.guardar(horario);
    this.horarios = this.horariosRepo.listar();
    this.registrarAuditoria('REGISTRO_HORARIO', horario);
    return { exito: true, mensaje: 'Horario registrado', horario };
  }

  modificarHorario(id, cambios) {
    const horario = this.horarios.find((item) => item.id === Number(id));
    if (!horario) return { exito: false, mensaje: 'Horario no encontrado' };
    if (Number(cambios.cupo) < 1) return { exito: false, mensaje: 'El cupo mínimo es 1' };
    if (horario.citasAsignadas > Number(cambios.cupo)) return { exito: false, mensaje: 'No se puede reducir el cupo por debajo de las citas asignadas' };
    this.horariosRepo.actualizar(Number(id), cambios);
    this.horarios = this.horariosRepo.listar();
    this.registrarAuditoria('MODIFICACION_HORARIO', { id, cambios });
    return { exito: true, mensaje: 'Horario modificado' };
  }

  eliminarHorario(id) {
    const horario = this.horarios.find((item) => item.id === Number(id));
    if (!horario) return { exito: false, mensaje: 'Horario no encontrado' };
    if (horario.citasAsignadas > 0) return { exito: false, mensaje: 'No se puede eliminar un horario con citas dependientes' };
    this.horariosRepo.eliminar(Number(id));
    this.horarios = this.horariosRepo.listar();
    this.registrarAuditoria('ELIMINACION_HORARIO', { id });
    return { exito: true, mensaje: 'Horario eliminado' };
  }

  inactivarHorario(id) {
    const horario = this.horarios.find((item) => item.id === Number(id));
    if (!horario) return { exito: false, mensaje: 'Horario no encontrado' };
    if (horario.citasAsignadas > 0) return { exito: false, mensaje: 'No se puede inactivar un horario con citas dependientes' };
    horario.estado = 'Inactivo';
    this.horariosRepo.actualizar(Number(id), { estado: 'Inactivo' });
    this.horarios = this.horariosRepo.listar();
    this.registrarAuditoria('INACTIVACION_HORARIO', { id });
    return { exito: true, mensaje: 'Horario inactivado' };
  }

  listarHorariosPorDia(fecha, estado = null) {
    return this.horarios.filter((item) => item.fecha === fecha && (!estado || item.estado === estado));
  }

  registrarConsultorio({ nombre, capacidad, estado = 'Activo' }) {
    if (!nombre || !capacidad) return { exito: false, mensaje: 'Nombre y capacidad obligatorios' };
    const consultorio = new Consultorio({ id: Date.now(), nombre, capacidad: Number(capacidad), estado });
    this.consultoriosRepo.guardar(consultorio);
    this.consultorios = this.consultoriosRepo.listar();
    this.registrarAuditoria('REGISTRO_CONSULTORIO', consultorio);
    return { exito: true, mensaje: 'Consultorio registrado', consultorio };
  }

  eliminarConsultorio(id) {
    const consultorio = this.consultorios.find((item) => item.id === Number(id));
    if (!consultorio) return { exito: false, mensaje: 'Consultorio no encontrado' };
    const tieneHorariosActivos = this.horarios.some((h) => h.consultorioId === Number(id) && h.estado === 'Activo');
    if (tieneHorariosActivos) return { exito: false, mensaje: 'No se puede eliminar un consultorio con horarios activos' };
    this.consultoriosRepo.eliminar(Number(id));
    this.consultorios = this.consultoriosRepo.listar();
    this.registrarAuditoria('ELIMINACION_CONSULTORIO', { id });
    return { exito: true, mensaje: 'Consultorio eliminado' };
  }

  asignarFisioterapeutaYConsultorio(id, { fisioterapeuta, consultorioId }) {
    const horario = this.horarios.find((item) => item.id === Number(id));
    if (!horario) return { exito: false, mensaje: 'Horario no encontrado' };
    horario.fisioterapeuta = fisioterapeuta;
    horario.consultorioId = Number(consultorioId);
    this.horariosRepo.actualizar(Number(id), { fisioterapeuta, consultorioId: Number(consultorioId) });
    this.horarios = this.horariosRepo.listar();
    this.registrarAuditoria('ASIGNACION_HORARIO', { id, fisioterapeuta, consultorioId });
    return { exito: true, mensaje: 'Horario asignado', horario };
  }

  registrarAuditoria(accion, datos) {
    const registro = new Auditoria({ id: Date.now(), mensaje: `${accion}: ${JSON.stringify(datos)}`, fecha: new Date().toISOString() });
    this.auditoriaRepo.guardar(registro);
    this.auditoria = this.auditoriaRepo.listar();
    this.gestor?.notificar?.({ tipo: accion, datos: registro });
  }

  obtenerAuditoria() {
    return this.auditoria;
  }

  obtenerConsultorios() {
    return this.consultorios;
  }

  obtenerHorarios() {
    return this.horarios;
  }
}
