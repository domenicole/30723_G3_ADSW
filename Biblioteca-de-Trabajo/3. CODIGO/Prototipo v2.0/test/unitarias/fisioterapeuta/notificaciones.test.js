/**
 * @jest-environment jsdom
 */
import { NotificacionObserver } from '../../../src/negocio/NotificacionObserver.js';
import { ServicioNotificaciones } from '../../../src/negocio/ServicioNotificaciones.js';
import { GestorEventos } from '../../../src/negocio/GestorEventos.js';
import { CanalWhatsApp } from '../../../src/negocio/strategy/CanalWhatsApp.js';

// REQ002 - Generar Notificación (PP-FICITAS-2026-01, UT002-1 a UT002-9)
// Requiere jsdom para document.getElementById; se mockea window.alert para no ensuciar la salida.

beforeEach(() => {
  window.alert = jest.fn();
});

describe('NotificacionObserver.actualizar', () => {
  test('UT002-1: ignora eventos que no son de tipo CITA_*', () => {
    const observer = new NotificacionObserver({ notificar: jest.fn() }, { obtenerPorId: jest.fn() }, { guardar: jest.fn() });
    observer.procesarEventoCita = jest.fn();

    observer.actualizar({ tipo: 'LOGIN' });

    expect(observer.procesarEventoCita).not.toHaveBeenCalled();
  });

  test('procesa eventos que sí son de tipo CITA_*', () => {
    const observer = new NotificacionObserver({ notificar: jest.fn() }, { obtenerPorId: jest.fn() }, { guardar: jest.fn() });
    observer.procesarEventoCita = jest.fn();

    observer.actualizar({ tipo: 'CITA_REGISTRADA', datos: { id: 1 } });

    expect(observer.procesarEventoCita).toHaveBeenCalledTimes(1);
  });
});

describe('NotificacionObserver.generarMensaje', () => {
  let observer;

  beforeEach(() => {
    observer = new NotificacionObserver({ notificar: jest.fn() }, { obtenerPorId: jest.fn() }, { guardar: jest.fn() });
  });

  test('UT002-2: usa los datos reales de la cita cuando están completos', () => {
    const cita = { id: 42, fecha: '2026-08-01', hora: '10:00', servicio: 'Terapia física', estado: 'Programada' };
    const mensaje = observer.generarMensaje('CITA_REGISTRADA', cita);
    expect(mensaje).toBe('Su cita 42 ha sido registró. Fecha: 2026-08-01, Hora: 10:00, Servicio: Terapia física, Estado: Programada.');
  });

  test('UT002-3: usa valores por defecto cuando faltan campos de la cita', () => {
    const cita = { id: 7 };
    const mensaje = observer.generarMensaje('CITA_CANCELADA', cita);
    expect(mensaje).toBe('Su cita 7 ha sido canceló. Fecha: N/A, Hora: N/A, Servicio: Servicio no definido, Estado: Desconocido.');
  });
});

describe('NotificacionObserver.procesarEventoCita', () => {
  test('UT002-4: muestra aviso de error y no registra notificación si no se encuentra el paciente', () => {
    const pacienteRepo = { obtenerPorId: jest.fn().mockReturnValue(undefined) };
    const observer = new NotificacionObserver({ notificar: jest.fn() }, pacienteRepo, { guardar: jest.fn() });
    observer.mostrarAviso = jest.fn();
    observer.servicioNotificaciones.enviar = jest.fn();
    observer.servicioNotificaciones.registrarPendiente = jest.fn();

    observer.procesarEventoCita({ tipo: 'CITA_REGISTRADA', datos: { id: 1, pacienteId: 999 } });

    expect(observer.mostrarAviso).toHaveBeenCalledWith('No se encontró el paciente para la cita.', 'error');
    expect(observer.servicioNotificaciones.enviar).not.toHaveBeenCalled();
    expect(observer.servicioNotificaciones.registrarPendiente).not.toHaveBeenCalled();
  });

  test('UT002-5: registra pendiente cuando el paciente no tiene datos de contacto para el canal preferido', () => {
    const paciente = { id: 1, nombre: 'Ana', canalPreferido: 'Correo', correo: null, telefono: null };
    const pacienteRepo = { obtenerPorId: jest.fn().mockReturnValue(paciente) };
    const observer = new NotificacionObserver({ notificar: jest.fn() }, pacienteRepo, { guardar: jest.fn() });
    observer.servicioNotificaciones.registrarPendiente = jest.fn().mockReturnValue({ exito: false });

    observer.procesarEventoCita({ tipo: 'CITA_REGISTRADA', datos: { id: 1, pacienteId: 1 } });

    expect(observer.servicioNotificaciones.registrarPendiente).toHaveBeenCalledWith(
      expect.objectContaining({ motivo: 'Faltan datos de contacto para Correo' })
    );
  });

  test('UT002-6: envía por WhatsApp usando el teléfono como destinatario', () => {
    const paciente = { id: 1, nombre: 'Ana', canalPreferido: 'WhatsApp', telefono: '0987654321' };
    const pacienteRepo = { obtenerPorId: jest.fn().mockReturnValue(paciente) };
    const observer = new NotificacionObserver({ notificar: jest.fn() }, pacienteRepo, { guardar: jest.fn() });
    observer.servicioNotificaciones.enviar = jest.fn().mockReturnValue({ exito: true });

    observer.procesarEventoCita({ tipo: 'CITA_REGISTRADA', datos: { id: 1, pacienteId: 1 } });

    expect(observer.servicioNotificaciones.enviar).toHaveBeenCalledWith(
      expect.objectContaining({ destinatario: '0987654321', canal: 'WhatsApp' })
    );
  });
});

describe('ServicioNotificaciones', () => {
  test('UT002-7: enviar guarda el registro como Enviado y notifica NOTIFICACION_REGISTRADA', () => {
    const notificacionRepo = { guardar: jest.fn() };
    const gestor = { notificar: jest.fn() };
    const servicio = new ServicioNotificaciones(gestor, notificacionRepo);

    const resultado = servicio.enviar({ destinatario: 'ana@test.com', canal: 'Correo', mensaje: 'Hola', citaId: 1, pacienteId: 1 });

    expect(notificacionRepo.guardar).toHaveBeenCalledWith(expect.objectContaining({ estado: 'Enviado' }));
    expect(gestor.notificar).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'NOTIFICACION_REGISTRADA' }));
    expect(resultado.exito).toBe(true);
  });

  test('UT002-8: registrarPendiente guarda el registro como Pendiente y retorna el motivo', () => {
    const notificacionRepo = { guardar: jest.fn() };
    const gestor = { notificar: jest.fn() };
    const servicio = new ServicioNotificaciones(gestor, notificacionRepo);

    const resultado = servicio.registrarPendiente({ destinatario: 'Ana', canal: 'Correo', mensaje: 'Hola', motivo: 'Faltan datos de contacto para Correo' });

    expect(notificacionRepo.guardar).toHaveBeenCalledWith(expect.objectContaining({ estado: 'Pendiente' }));
    expect(resultado).toEqual({ exito: false, mensaje: 'Faltan datos de contacto para Correo', registro: expect.any(Object) });
  });
});

describe('GestorEventos.notificar', () => {
  test('UT002-9: notifica a todos los observadores suscritos exactamente una vez', () => {
    const gestor = new GestorEventos();
    const observador1 = { actualizar: jest.fn() };
    const observador2 = { actualizar: jest.fn() };
    gestor.suscribir(observador1);
    gestor.suscribir(observador2);

    const evento = { tipo: 'CITA_REGISTRADA', datos: {} };
    gestor.notificar(evento);

    expect(observador1.actualizar).toHaveBeenCalledTimes(1);
    expect(observador1.actualizar).toHaveBeenCalledWith(evento);
    expect(observador2.actualizar).toHaveBeenCalledTimes(1);
    expect(observador2.actualizar).toHaveBeenCalledWith(evento);
  });
});

describe('CanalWhatsApp.enviar', () => {
  test('reporta el envío como exitoso', () => {
    expect(new CanalWhatsApp().enviar('Hola')).toBe(true);
  });
});
