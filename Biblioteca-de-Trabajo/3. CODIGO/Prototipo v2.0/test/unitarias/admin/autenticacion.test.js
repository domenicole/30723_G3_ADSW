import { ValidacionDecorador } from '../../../src/negocio/ValidacionDecorador.js';
import { ServicioAutenticacion } from '../../../src/negocio/ServicioAutenticacion.js';
import { UsuarioRepo } from '../../../src/datos/UsuarioRepo.js';

// REQ000 - Inicio de sesión (PP-FICITAS-2026-01, UT000-1 a UT000-7)

describe('ValidacionDecorador.iniciarSesion', () => {
  let servicioBase;
  let decorador;

  beforeEach(() => {
    servicioBase = { iniciarSesion: jest.fn().mockResolvedValue({ exito: true }) };
    decorador = new ValidacionDecorador(servicioBase);
  });

  test('UT000-1: rechaza correo con contenido tipo <script>', async () => {
    const resultado = await decorador.iniciarSesion('<script>alert(1)</script>@test.com', '12345');
    expect(resultado).toEqual({ exito: false, mensaje: 'La entrada contiene contenido no permitido' });
    expect(servicioBase.iniciarSesion).not.toHaveBeenCalled();
  });

  test('UT000-2: rechaza correo sin formato válido', async () => {
    const resultado = await decorador.iniciarSesion('correo-invalido', '12345');
    expect(resultado).toEqual({ exito: false, mensaje: 'El correo electrónico no es válido' });
  });

  test('UT000-3: rechaza contraseña vacía', async () => {
    const resultado = await decorador.iniciarSesion('user@test.com', '');
    expect(resultado).toEqual({ exito: false, mensaje: 'La contraseña es requerida' });
  });

  test('UT000-4: delega en servicioBase cuando correo y contraseña son válidos', async () => {
    const resultado = await decorador.iniciarSesion('user@test.com', '12345');
    expect(servicioBase.iniciarSesion).toHaveBeenCalledWith('user@test.com', '12345');
    expect(resultado).toEqual({ exito: true });
  });
});

describe('ServicioAutenticacion.iniciarSesion', () => {
  test('UT000-5: propaga mensaje por defecto cuando el repo falla sin mensaje', async () => {
    const usuarioRepo = { login: jest.fn().mockResolvedValue({ exito: false }) };
    const gestor = { notificar: jest.fn() };
    const servicio = new ServicioAutenticacion(gestor, usuarioRepo);

    const resultado = await servicio.iniciarSesion('user@test.com', '12345');

    expect(resultado).toEqual({ exito: false, mensaje: 'Credenciales inválidas' });
    expect(gestor.notificar).not.toHaveBeenCalled();
  });

  test('UT000-6: notifica el login y retorna usuario/perfil cuando el repo tiene éxito', async () => {
    const usuario = { id: 1, correo: 'user@test.com' };
    const perfil = { id: 2, nombre: 'Auxiliar' };
    const usuarioRepo = { login: jest.fn().mockResolvedValue({ exito: true, usuario, perfil }) };
    const gestor = { notificar: jest.fn() };
    const servicio = new ServicioAutenticacion(gestor, usuarioRepo);

    const resultado = await servicio.iniciarSesion('user@test.com', '12345');

    expect(gestor.notificar).toHaveBeenCalledTimes(1);
    expect(gestor.notificar).toHaveBeenCalledWith({ tipo: 'LOGIN', datos: { usuario, perfil } });
    expect(resultado).toEqual({ exito: true, usuario, perfil });
  });

  test('UT000-7: propaga sin alterar el mensaje que retorna el backend (cuenta bloqueada)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ exito: false, mensaje: 'Cuenta bloqueada' }),
    });

    const usuarioRepo = new UsuarioRepo();
    const gestor = { notificar: jest.fn() };
    const servicio = new ServicioAutenticacion(gestor, usuarioRepo);

    const resultado = await servicio.iniciarSesion('user@test.com', '12345');

    expect(resultado).toEqual({ exito: false, mensaje: 'Cuenta bloqueada' });
    expect(gestor.notificar).not.toHaveBeenCalled();

    delete global.fetch;
  });
});
