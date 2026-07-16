import { LogAuditoriaObserver } from '../../../src/negocio/LogAuditoriaObserver.js';

// Observer de auditoría (patrón Observer, suscrito junto a NotificacionObserver en GestorEventos).

describe('LogAuditoriaObserver.actualizar', () => {
  test('ignora eventos sin tipo', () => {
    const auditoriaRepo = { guardar: jest.fn() };
    const observer = new LogAuditoriaObserver(auditoriaRepo);

    observer.actualizar(null);
    observer.actualizar({});

    expect(auditoriaRepo.guardar).not.toHaveBeenCalled();
  });

  test('registra el evento con usuario, perfil y datos del cambio', () => {
    const auditoriaRepo = { guardar: jest.fn() };
    const observer = new LogAuditoriaObserver(auditoriaRepo);

    observer.actualizar({
      tipo: 'PERFIL_REGISTRADO',
      datos: { usuario: { id: 7 }, perfil: { nombre: 'Administrador' }, modificados: { nombre: 'Auxiliar' } },
    });

    expect(auditoriaRepo.guardar).toHaveBeenCalledWith(
      expect.objectContaining({
        usuarioId: 7,
        perfilNombre: 'Administrador',
        accion: 'PERFIL_REGISTRADO',
        datosNuevos: { nombre: 'Auxiliar' },
      })
    );
  });

  test('usa valores por defecto cuando faltan usuario/perfil en el evento', () => {
    const auditoriaRepo = { guardar: jest.fn() };
    const observer = new LogAuditoriaObserver(auditoriaRepo);

    observer.actualizar({ tipo: 'CITA_REGISTRADA', datos: {} });

    expect(auditoriaRepo.guardar).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: 'Sistema', perfilNombre: 'Desconocido' })
    );
  });
});
