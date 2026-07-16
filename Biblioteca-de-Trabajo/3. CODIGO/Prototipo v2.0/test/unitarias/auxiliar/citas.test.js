import { DisponibilidadDecorador } from '../../../src/negocio/DisponibilidadDecorador.js';
import { ServicioCitas } from '../../../src/negocio/ServicioCitas.js';
import { ServicioBaseDecorador } from '../../../src/negocio/ServicioBaseDecorador.js';

// REQ003 - Gestión de Citas (PP-FICITAS-2026-01, UT-003-1 a UT-003-12)

function fechaFutura(diasAdelante = 1) {
  const fecha = new Date(Date.now() + diasAdelante * 86400000);
  return fecha.toISOString().slice(0, 10);
}

describe('DisponibilidadDecorador.registrarCita - duración', () => {
  let servicioBase;
  let decorador;

  beforeEach(() => {
    servicioBase = {
      obtenerTodas: jest.fn().mockResolvedValue([]),
      registrarCita: jest.fn().mockResolvedValue({ exito: true, cita: {} }),
    };
    decorador = new DisponibilidadDecorador(servicioBase);
  });

  test('UT-003-1: duración 0 es rechazada', async () => {
    const resultado = await decorador.registrarCita('1710034065', 'Terapia', 'A', fechaFutura(), '10:00', '0', 'Dr. X');
    expect(resultado).toEqual({ exito: false, mensaje: 'La duración de la cita no es válida' });
  });

  test('UT-003-2: duración 120 pasa la validación (no rechaza)', async () => {
    const resultado = await decorador.registrarCita('1710034065', 'Terapia', 'A', fechaFutura(), '10:00', 120, 'Dr. X');
    expect(servicioBase.registrarCita).toHaveBeenCalled();
    expect(resultado.exito).toBe(true);
  });

  test('UT-003-3: duración 121 es rechazada por exceder el máximo', async () => {
    const resultado = await decorador.registrarCita('1710034065', 'Terapia', 'A', fechaFutura(), '10:00', 121, 'Dr. X');
    expect(resultado).toEqual({ exito: false, mensaje: 'Una cita no puede durar más de 2 horas' });
  });
});

describe('DisponibilidadDecorador.registrarCita - fecha/solapamiento', () => {
  let servicioBase;
  let decorador;

  beforeEach(() => {
    servicioBase = {
      obtenerTodas: jest.fn().mockResolvedValue([]),
      registrarCita: jest.fn().mockResolvedValue({ exito: true, cita: {} }),
    };
    decorador = new DisponibilidadDecorador(servicioBase);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('UT-003-4: fecha/hora en el pasado (ayer) es rechazada', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-15T12:00:00'));
    const resultado = await decorador.registrarCita('1710034065', 'Terapia', 'A', '2026-07-14', '10:00', 30, 'Dr. X');
    expect(resultado).toEqual({ exito: false, mensaje: 'No se puede agendar una cita en una fecha u hora pasada' });
  });

  test('UT-003-5: rechaza cuando se solapa con una cita activa del mismo consultorio', async () => {
    servicioBase.obtenerTodas.mockResolvedValue([
      { id: 1, consultorio: 'A', fecha: fechaFutura(), hora: '10:00', duracion: 60, estado: 'Programada' },
    ]);
    const resultado = await decorador.registrarCita('1710034065', 'Terapia', 'A', fechaFutura(), '10:30', 30, 'Dr. X');
    expect(resultado).toEqual({ exito: false, mensaje: 'El consultorio ya tiene una cita agendada en ese horario' });
  });

  test('UT-003-6: no cuenta como solapamiento si la cita existente está Cancelada', async () => {
    servicioBase.obtenerTodas.mockResolvedValue([
      { id: 1, consultorio: 'A', fecha: fechaFutura(), hora: '10:00', duracion: 60, estado: 'Cancelada' },
    ]);
    const resultado = await decorador.registrarCita('1710034065', 'Terapia', 'A', fechaFutura(), '10:30', 30, 'Dr. X');
    expect(servicioBase.registrarCita).toHaveBeenCalled();
    expect(resultado.exito).toBe(true);
  });

  test('UT-003-7: no hay solapamiento cuando la nueva cita inicia justo al terminar la existente', async () => {
    servicioBase.obtenerTodas.mockResolvedValue([
      { id: 1, consultorio: 'A', fecha: fechaFutura(), hora: '09:00', duracion: 60, estado: 'Programada' },
    ]);
    const resultado = await decorador.registrarCita('1710034065', 'Terapia', 'A', fechaFutura(), '10:00', 30, 'Dr. X');
    expect(servicioBase.registrarCita).toHaveBeenCalled();
    expect(resultado.exito).toBe(true);
  });
});

describe('DisponibilidadDecorador.registrarCita - validación de paciente', () => {
  test('rechaza cuando la cédula no corresponde a ningún paciente registrado', async () => {
    const servicioBase = { obtenerTodas: jest.fn().mockResolvedValue([]), registrarCita: jest.fn() };
    const pacienteRepo = { listar: jest.fn().mockResolvedValue([]) };
    const decorador = new DisponibilidadDecorador(servicioBase, pacienteRepo);

    const resultado = await decorador.registrarCita('0000000000', 'Terapia', 'A', fechaFutura(), '10:00', 30, 'Dr. X');

    expect(resultado).toEqual({ exito: false, mensaje: 'No existe un paciente registrado con esa cédula' });
    expect(servicioBase.registrarCita).not.toHaveBeenCalled();
  });

  test('rechaza cuando el paciente no está activo', async () => {
    const servicioBase = { obtenerTodas: jest.fn().mockResolvedValue([]), registrarCita: jest.fn() };
    const pacienteRepo = { listar: jest.fn().mockResolvedValue([{ cedula: '1710034065', estado: 'Inactivo' }]) };
    const decorador = new DisponibilidadDecorador(servicioBase, pacienteRepo);

    const resultado = await decorador.registrarCita('1710034065', 'Terapia', 'A', fechaFutura(), '10:00', 30, 'Dr. X');

    expect(resultado).toEqual({ exito: false, mensaje: 'El paciente no está activo. No se pueden agendar citas.' });
  });
});

describe('DisponibilidadDecorador.reprogramarCita', () => {
  test('UT-003-8: retorna error cuando la cita no existe', async () => {
    const servicioBase = { obtenerTodas: jest.fn().mockResolvedValue([]), reprogramarCita: jest.fn() };
    const decorador = new DisponibilidadDecorador(servicioBase);

    const resultado = await decorador.reprogramarCita(999, fechaFutura(), '10:00', 'Terapia', 'A', 'Dr. X');

    expect(resultado).toEqual({ exito: false, mensaje: 'Cita no encontrada' });
    expect(servicioBase.reprogramarCita).not.toHaveBeenCalled();
  });

  test('UT-003-9: reprogramar a la misma franja de la propia cita no cuenta como autosolapamiento', async () => {
    const citaActual = { id: 1, consultorio: 'A', fecha: fechaFutura(), hora: '10:00', duracion: 30, estado: 'Programada' };
    const servicioBase = {
      obtenerTodas: jest.fn().mockResolvedValue([citaActual]),
      reprogramarCita: jest.fn().mockResolvedValue({ exito: true, cita: citaActual }),
    };
    const decorador = new DisponibilidadDecorador(servicioBase);

    const resultado = await decorador.reprogramarCita(1, fechaFutura(), '10:00', 'Terapia', 'A', 'Dr. X');

    expect(servicioBase.reprogramarCita).toHaveBeenCalledWith(1, fechaFutura(), '10:00', 'Terapia', 'A', 'Dr. X');
    expect(resultado.exito).toBe(true);
  });
});

describe('ServicioCitas', () => {
  test('UT-003-10: registrarCita guarda la cita y notifica CITA_REGISTRADA', async () => {
    const citaRepo = { guardar: jest.fn().mockResolvedValue(true) };
    const gestor = { notificar: jest.fn() };
    const servicio = new ServicioCitas(gestor, 1, citaRepo);

    const resultado = await servicio.registrarCita('1710034065', 'Terapia', 'A', fechaFutura(), '10:00', 30, 'Dr. X');

    expect(citaRepo.guardar).toHaveBeenCalledTimes(1);
    expect(gestor.notificar).toHaveBeenCalledWith({ tipo: 'CITA_REGISTRADA', datos: expect.any(Object) });
    expect(resultado.exito).toBe(true);
  });

  test('UT-003-11: cancelarCita retorna error cuando citaRepo.actualizar devuelve null', async () => {
    const citaRepo = { actualizar: jest.fn().mockResolvedValue(null) };
    const gestor = { notificar: jest.fn() };
    const servicio = new ServicioCitas(gestor, 1, citaRepo);

    const resultado = await servicio.cancelarCita(999, 'Motivo');

    expect(resultado).toEqual({ exito: false, mensaje: 'Cita no encontrada' });
    expect(gestor.notificar).not.toHaveBeenCalled();
  });

  test('UT-003-12: cancelarCita notifica CITA_CANCELADA cuando la cita existe', async () => {
    const citaCancelada = { id: 1, estado: 'Cancelada' };
    const citaRepo = { actualizar: jest.fn().mockResolvedValue(citaCancelada) };
    const gestor = { notificar: jest.fn() };
    const servicio = new ServicioCitas(gestor, 1, citaRepo);

    const resultado = await servicio.cancelarCita(1, 'Motivo');

    expect(gestor.notificar).toHaveBeenCalledWith({ tipo: 'CITA_CANCELADA', datos: citaCancelada });
    expect(resultado).toEqual({ exito: true, mensaje: 'Cita cancelada', cita: citaCancelada });
  });

  test('reprogramarCita retorna error cuando la cita no existe', async () => {
    const citaRepo = { obtenerPorId: jest.fn().mockResolvedValue(null) };
    const gestor = { notificar: jest.fn() };
    const servicio = new ServicioCitas(gestor, 1, citaRepo);

    const resultado = await servicio.reprogramarCita(999, fechaFutura(), '10:00', 'Terapia', 'A', 'Dr. X');

    expect(resultado).toEqual({ exito: false, mensaje: 'Cita no encontrada' });
  });
});

describe('ServicioBaseDecorador', () => {
  test('obtenerTodas delega en el servicio base', () => {
    const servicioBase = { obtenerTodas: jest.fn().mockReturnValue(['cita1']) };
    const decorador = new ServicioBaseDecorador(servicioBase);

    expect(decorador.obtenerTodas()).toEqual(['cita1']);
    expect(servicioBase.obtenerTodas).toHaveBeenCalledTimes(1);
  });
});
