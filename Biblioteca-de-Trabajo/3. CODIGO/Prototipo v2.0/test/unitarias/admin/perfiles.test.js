import { ServicioPerfiles } from '../../../src/negocio/ServicioPerfiles.js';

// REQ005 - Gestionar Perfiles (PP-FICITAS-2026-01, UT005-1 a UT005-3, ampliado para cobertura de ramas)

function crearServicio({ perfiles = [] } = {}) {
  const perfilRepo = {
    listar: jest.fn().mockResolvedValue(perfiles),
    guardar: jest.fn().mockResolvedValue(true),
    actualizar: jest.fn().mockResolvedValue(true),
  };
  const gestor = { notificar: jest.fn() };
  const servicio = new ServicioPerfiles(gestor, { id: 1 }, { nombre: 'Administrador' }, perfilRepo);
  return { servicio, perfilRepo, gestor };
}

describe('ServicioPerfiles.registrarPerfil', () => {
  test('UT005-1: registra un perfil con datos válidos y notifica el evento', async () => {
    const { servicio, perfilRepo, gestor } = crearServicio();

    const resultado = await servicio.registrarPerfil({ nombre: 'Auxiliar', descripcion: 'Rol auxiliar', permisos: ['pacientes'] });

    expect(perfilRepo.guardar).toHaveBeenCalledTimes(1);
    expect(gestor.notificar).toHaveBeenCalledTimes(1);
    expect(gestor.notificar.mock.calls[0][0].tipo).toBe('PERFIL_REGISTRADO');
    expect(resultado.exito).toBe(true);
  });

  test('rechaza cuando falta el nombre', async () => {
    const { servicio, perfilRepo } = crearServicio();
    const resultado = await servicio.registrarPerfil({ nombre: '  ', descripcion: 'x', permisos: ['a'] });
    expect(resultado).toEqual({ exito: false, mensaje: 'El nombre del perfil es obligatorio' });
    expect(perfilRepo.guardar).not.toHaveBeenCalled();
  });

  test('rechaza cuando no hay permisos seleccionados', async () => {
    const { servicio } = crearServicio();
    const resultado = await servicio.registrarPerfil({ nombre: 'Auxiliar', descripcion: 'x', permisos: [] });
    expect(resultado).toEqual({ exito: false, mensaje: 'Debe seleccionar al menos un permiso' });
  });

  test('rechaza nombre duplicado (case-insensitive)', async () => {
    const { servicio } = crearServicio({ perfiles: [{ id: 9, nombre: 'Auxiliar' }] });
    const resultado = await servicio.registrarPerfil({ nombre: 'auxiliar', descripcion: 'x', permisos: ['a'] });
    expect(resultado).toEqual({ exito: false, mensaje: 'Ya existe un perfil con ese nombre' });
  });
});

describe('ServicioPerfiles.modificarPerfil', () => {
  test('UT005-2: retorna error cuando el id no existe entre los perfiles', async () => {
    const { servicio, perfilRepo } = crearServicio({ perfiles: [{ id: 1, nombre: 'Administrador', estado: 'Activo' }] });

    const resultado = await servicio.modificarPerfil(999, { nombre: 'X', descripcion: 'Y', permisos: ['a'] });

    expect(resultado).toEqual({ exito: false, mensaje: 'Perfil no encontrado' });
    expect(perfilRepo.actualizar).not.toHaveBeenCalled();
  });

  test('UT005-3: actualiza un perfil existente y notifica el evento', async () => {
    const perfilExistente = { id: 5, nombre: 'Auxiliar', descripcion: 'Rol', estado: 'Activo', permisos: ['pacientes'] };
    const { servicio, perfilRepo, gestor } = crearServicio({ perfiles: [perfilExistente] });

    const resultado = await servicio.modificarPerfil(5, { nombre: 'Auxiliar Senior', descripcion: 'Rol actualizado', permisos: ['pacientes', 'citas'] });

    expect(perfilRepo.actualizar).toHaveBeenCalledWith(5, expect.objectContaining({ nombre: 'Auxiliar Senior' }));
    expect(gestor.notificar.mock.calls[0][0].tipo).toBe('PERFIL_ACTUALIZADO');
    expect(resultado).toEqual({ exito: true, mensaje: 'Perfil actualizado', perfil: expect.objectContaining({ nombre: 'Auxiliar Senior' }) });
  });

  test('impide desactivar el único perfil administrador activo', async () => {
    const admin = { id: 1, nombre: 'Administrador', descripcion: 'Rol admin', estado: 'Activo', permisos: ['todo'] };
    const { servicio } = crearServicio({ perfiles: [admin] });

    const resultado = await servicio.modificarPerfil(1, { nombre: 'Administrador', descripcion: 'Rol admin', estado: 'Inactivo', permisos: ['todo'] });

    expect(resultado).toEqual({ exito: false, mensaje: 'No se puede desactivar el único perfil administrador activo' });
  });
});
