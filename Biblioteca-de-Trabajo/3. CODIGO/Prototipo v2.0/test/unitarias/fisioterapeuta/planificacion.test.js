// REQ006 - Gestión de Planificación (PP-FICITAS-2026-01, UT-006-1 a UT-006-11)
// ServicioPlanificacion instancia sus propios repos con `new HorarioRepo()` / `new ConsultorioRepo()` /
// `new AuditoriaRepo()` y no permite inyectarlos por constructor, así que se aíslan con jest.mock
// tal como indica el plan de pruebas (sección 4, Herramientas y Configuración).

jest.mock('../../../src/datos/HorarioRepo.js', () => ({
  HorarioRepo: jest.fn().mockImplementation(function HorarioRepoMock() {
    this._items = [];
    this.listar = jest.fn(() => this._items);
    this.guardar = jest.fn((horario) => this._items.push(horario));
    this.actualizar = jest.fn((id, cambios) => {
      const item = this._items.find((i) => i.id === id);
      if (item) Object.assign(item, cambios);
    });
    this.eliminar = jest.fn((id) => {
      this._items = this._items.filter((i) => i.id !== id);
    });
  }),
}));

jest.mock('../../../src/datos/ConsultorioRepo.js', () => ({
  ConsultorioRepo: jest.fn().mockImplementation(function ConsultorioRepoMock() {
    this._items = [];
    this.listar = jest.fn(() => this._items);
    this.guardar = jest.fn((consultorio) => this._items.push(consultorio));
    this.eliminar = jest.fn((id) => {
      this._items = this._items.filter((i) => i.id !== id);
    });
  }),
}));

jest.mock('../../../src/datos/AuditoriaRepo.js', () => ({
  AuditoriaRepo: jest.fn().mockImplementation(function AuditoriaRepoMock() {
    this._items = [];
    this.listar = jest.fn(() => this._items);
    this.guardar = jest.fn((registro) => this._items.push(registro));
  }),
}));

import { ServicioPlanificacion } from '../../../src/negocio/ServicioPlanificacion.js';
import { HorarioRepo } from '../../../src/datos/HorarioRepo.js';
import { ConsultorioRepo } from '../../../src/datos/ConsultorioRepo.js';
import { AuditoriaRepo } from '../../../src/datos/AuditoriaRepo.js';

function ultimaInstancia(ClaseMockeada) {
  const instancias = ClaseMockeada.mock.instances;
  return instancias[instancias.length - 1];
}

function crearServicio() {
  const gestor = { notificar: jest.fn() };
  const servicio = new ServicioPlanificacion(gestor, { id: 1, nombre: 'Administrador' });
  return {
    servicio,
    gestor,
    horarioRepo: ultimaInstancia(HorarioRepo),
    consultorioRepo: ultimaInstancia(ConsultorioRepo),
    auditoriaRepo: ultimaInstancia(AuditoriaRepo),
  };
}

const DATOS_HORARIO_BASE = { fecha: '2026-08-01', horaInicio: '08:00', horaFin: '09:00', cupo: 3, consultorioId: 1, fisioterapeuta: 'Dra. López' };

describe('ServicioPlanificacion.registrarHorario', () => {
  test('UT-006-1: rechaza cuando falta un campo obligatorio (horaFin)', () => {
    const { servicio } = crearServicio();
    const { horaFin, ...datosIncompletos } = DATOS_HORARIO_BASE;
    const resultado = servicio.registrarHorario(datosIncompletos);
    expect(resultado).toEqual({ exito: false, mensaje: 'Complete todos los datos del horario' });
  });

  test('UT-006-2: rechaza cupo por debajo de 1 (cupo=0 cae en campos incompletos por ser falsy)', () => {
    const { servicio } = crearServicio();
    const resultadoCero = servicio.registrarHorario({ ...DATOS_HORARIO_BASE, cupo: 0 });
    expect(resultadoCero).toEqual({ exito: false, mensaje: 'Complete todos los datos del horario' });

    const resultadoNegativo = servicio.registrarHorario({ ...DATOS_HORARIO_BASE, cupo: -1 });
    expect(resultadoNegativo).toEqual({ exito: false, mensaje: 'El cupo mínimo es 1' });
  });

  test('UT-006-3: cupo = 1 con datos completos crea el horario y registra auditoría', () => {
    const { servicio, horarioRepo, auditoriaRepo } = crearServicio();
    const resultado = servicio.registrarHorario({ ...DATOS_HORARIO_BASE, cupo: 1 });
    expect(resultado.exito).toBe(true);
    expect(horarioRepo.guardar).toHaveBeenCalledTimes(1);
    expect(auditoriaRepo.guardar).toHaveBeenCalledTimes(1);
  });

  test('rechaza cuando se solapa con un horario existente del mismo consultorio', () => {
    const { servicio } = crearServicio();
    servicio.registrarHorario(DATOS_HORARIO_BASE);
    const resultado = servicio.registrarHorario({ ...DATOS_HORARIO_BASE, horaInicio: '08:30', horaFin: '09:30' });
    expect(resultado).toEqual({ exito: false, mensaje: 'El consultorio ya tiene un horario que se solapa en esa franja' });
  });
});

describe('ServicioPlanificacion.modificarHorario', () => {
  test('UT-006-4: retorna error cuando el id no existe', () => {
    const { servicio } = crearServicio();
    const resultado = servicio.modificarHorario(999, { cupo: 2 });
    expect(resultado).toEqual({ exito: false, mensaje: 'Horario no encontrado' });
  });

  test('UT-006-5: rechaza cupo = 0', () => {
    const { servicio } = crearServicio();
    const { horario } = servicio.registrarHorario(DATOS_HORARIO_BASE);
    const resultado = servicio.modificarHorario(horario.id, { cupo: 0 });
    expect(resultado).toEqual({ exito: false, mensaje: 'El cupo mínimo es 1' });
  });

  test('UT-006-6: rechaza reducir el cupo por debajo de las citas asignadas', () => {
    const { servicio } = crearServicio();
    const { horario } = servicio.registrarHorario(DATOS_HORARIO_BASE);
    horario.citasAsignadas = 5;
    const resultado = servicio.modificarHorario(horario.id, { cupo: 4 });
    expect(resultado).toEqual({ exito: false, mensaje: 'No se puede reducir el cupo por debajo de las citas asignadas' });
  });

  test('UT-006-7: acepta modificación cuando el cupo iguala las citas asignadas (límite exacto)', () => {
    const { servicio, horarioRepo } = crearServicio();
    const { horario } = servicio.registrarHorario(DATOS_HORARIO_BASE);
    horario.citasAsignadas = 5;
    const resultado = servicio.modificarHorario(horario.id, { cupo: 5 });
    expect(resultado.exito).toBe(true);
    expect(horarioRepo.actualizar).toHaveBeenCalledWith(horario.id, { cupo: 5 });
  });
});

describe('ServicioPlanificacion.eliminarHorario / inactivarHorario', () => {
  test('UT-006-8: rechaza eliminar un horario con citas dependientes', () => {
    const { servicio } = crearServicio();
    const { horario } = servicio.registrarHorario(DATOS_HORARIO_BASE);
    horario.citasAsignadas = 1;
    const resultado = servicio.eliminarHorario(horario.id);
    expect(resultado).toEqual({ exito: false, mensaje: 'No se puede eliminar un horario con citas dependientes' });
  });

  test('UT-006-9: inactiva un horario sin citas asignadas', () => {
    const { servicio, horarioRepo } = crearServicio();
    const { horario } = servicio.registrarHorario(DATOS_HORARIO_BASE);
    const resultado = servicio.inactivarHorario(horario.id);
    expect(resultado.exito).toBe(true);
    expect(horario.estado).toBe('Inactivo');
    expect(horarioRepo.actualizar).toHaveBeenCalledWith(horario.id, { estado: 'Inactivo' });
  });
});

describe('ServicioPlanificacion.eliminarConsultorio', () => {
  test('UT-006-10: rechaza eliminar un consultorio con horarios activos asociados', () => {
    const { servicio } = crearServicio();
    servicio.registrarHorario(DATOS_HORARIO_BASE); // consultorioId: 1 (auto-seedeado, estado Activo)
    const resultado = servicio.eliminarConsultorio(1);
    expect(resultado).toEqual({ exito: false, mensaje: 'No se puede eliminar un consultorio con horarios activos' });
  });

  test('elimina un consultorio sin horarios activos', () => {
    const { servicio, consultorioRepo } = crearServicio();
    const resultado = servicio.eliminarConsultorio(2);
    expect(resultado.exito).toBe(true);
    expect(consultorioRepo.eliminar).toHaveBeenCalledWith(2);
  });
});

describe('ServicioPlanificacion.asignarFisioterapeutaYConsultorio', () => {
  test('UT-006-11: actualiza fisioterapeuta/consultorio y registra auditoría', () => {
    const { servicio, horarioRepo, auditoriaRepo } = crearServicio();
    const { horario } = servicio.registrarHorario(DATOS_HORARIO_BASE);
    auditoriaRepo.guardar.mockClear();

    const resultado = servicio.asignarFisioterapeutaYConsultorio(horario.id, { fisioterapeuta: 'Dr. Nuevo', consultorioId: 2 });

    expect(resultado.exito).toBe(true);
    expect(horario.fisioterapeuta).toBe('Dr. Nuevo');
    expect(horario.consultorioId).toBe(2);
    expect(horarioRepo.actualizar).toHaveBeenCalledWith(horario.id, { fisioterapeuta: 'Dr. Nuevo', consultorioId: 2 });
    expect(auditoriaRepo.guardar).toHaveBeenCalledTimes(1);
  });
});
