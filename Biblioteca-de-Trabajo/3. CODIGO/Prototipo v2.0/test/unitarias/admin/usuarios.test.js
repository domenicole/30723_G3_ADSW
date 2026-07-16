import { ServicioUsuarios } from '../../../src/negocio/ServicioUsuarios.js';

// Gestión de cuentas de usuario (complementa REQ005 - administración de accesos).

describe('ServicioUsuarios', () => {
  test('registrarUsuario guarda el usuario y notifica sin exponer la contraseña', async () => {
    const usuarioRepo = { guardar: jest.fn().mockResolvedValue(true) };
    const gestor = { notificar: jest.fn() };
    const servicio = new ServicioUsuarios(gestor, { id: 1 }, usuarioRepo);

    const resultado = await servicio.registrarUsuario('jperez', 'jperez@test.com', 'secreta', 2);

    expect(usuarioRepo.guardar).toHaveBeenCalledTimes(1);
    expect(gestor.notificar).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'USUARIO_REGISTRADO', datos: expect.objectContaining({ password: undefined }) })
    );
    expect(resultado).toEqual({ exito: true, mensaje: 'Usuario registrado' });
  });

  test('modificarUsuario notifica solo cuando el repo confirma éxito', async () => {
    const usuarioRepo = { modificarUsuario: jest.fn().mockResolvedValue({ exito: true }) };
    const gestor = { notificar: jest.fn() };
    const servicio = new ServicioUsuarios(gestor, { id: 1 }, usuarioRepo);

    await servicio.modificarUsuario(5, { estado: 'Inactivo' });

    expect(gestor.notificar).toHaveBeenCalledWith({ tipo: 'USUARIO_MODIFICADO', datos: { id: 5, estado: 'Inactivo' } });
  });

  test('modificarUsuario no notifica cuando el repo reporta fallo', async () => {
    const usuarioRepo = { modificarUsuario: jest.fn().mockResolvedValue({ exito: false, mensaje: 'Error' }) };
    const gestor = { notificar: jest.fn() };
    const servicio = new ServicioUsuarios(gestor, { id: 1 }, usuarioRepo);

    const resultado = await servicio.modificarUsuario(5, { estado: 'Inactivo' });

    expect(gestor.notificar).not.toHaveBeenCalled();
    expect(resultado).toEqual({ exito: false, mensaje: 'Error' });
  });
});
