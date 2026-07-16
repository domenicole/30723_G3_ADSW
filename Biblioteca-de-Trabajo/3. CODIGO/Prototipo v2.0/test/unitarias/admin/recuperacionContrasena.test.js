import { ValidacionDecorador } from '../../../src/negocio/ValidacionDecorador.js';
import { ServicioAutenticacion } from '../../../src/negocio/ServicioAutenticacion.js';

// REQ001 - Recuperación de contraseña (PP-FICITAS-2026-01, UT-001-1 a UT-001-3 del plan,
// ampliados aquí contra la implementación real: ValidacionDecorador.solicitarRecuperacion /
// verificarCodigoRecuperacion / cambiarContrasena, delegando en ServicioAutenticacion -> UsuarioRepo).

describe('ValidacionDecorador.solicitarRecuperacion', () => {
  let servicioBase;
  let decorador;

  beforeEach(() => {
    servicioBase = {
      solicitarRecuperacion: jest.fn().mockResolvedValue({ exito: true }),
      verificarCodigoRecuperacion: jest.fn().mockResolvedValue({ exito: true }),
      cambiarContrasena: jest.fn().mockResolvedValue({ exito: true }),
    };
    decorador = new ValidacionDecorador(servicioBase);
  });

  test('UT-001-1: rechaza correo con formato inválido', async () => {
    const resultado = await decorador.solicitarRecuperacion('correo-invalido');
    expect(resultado).toEqual({ exito: false, mensaje: 'El correo electrónico no es válido' });
    expect(servicioBase.solicitarRecuperacion).not.toHaveBeenCalled();
  });

  test('UT-001-2: delega en servicioBase cuando el correo es válido', async () => {
    const resultado = await decorador.solicitarRecuperacion('user@test.com');
    expect(servicioBase.solicitarRecuperacion).toHaveBeenCalledWith('user@test.com');
    expect(resultado).toEqual({ exito: true });
  });

  test('UT-001-3: rechaza código que no tiene exactamente 6 dígitos', async () => {
    const resultado = await decorador.verificarCodigoRecuperacion('user@test.com', '12345');
    expect(resultado).toEqual({ exito: false, mensaje: 'El código debe contener 6 dígitos' });
    expect(servicioBase.verificarCodigoRecuperacion).not.toHaveBeenCalled();
  });

  test('UT-001-4: delega verificación cuando el código tiene 6 dígitos (límite permitido)', async () => {
    const resultado = await decorador.verificarCodigoRecuperacion('user@test.com', '123456');
    expect(servicioBase.verificarCodigoRecuperacion).toHaveBeenCalledWith('user@test.com', '123456');
    expect(resultado).toEqual({ exito: true });
  });

  test('UT-001-5: rechaza nueva contraseña con menos de 5 caracteres', async () => {
    const resultado = await decorador.cambiarContrasena('user@test.com', '123456', '1234', '1234');
    expect(resultado).toEqual({ exito: false, mensaje: 'La nueva contraseña debe tener al menos 5 caracteres' });
  });

  test('UT-001-6: rechaza cuando la confirmación no coincide', async () => {
    const resultado = await decorador.cambiarContrasena('user@test.com', '123456', '12345', '54321');
    expect(resultado).toEqual({ exito: false, mensaje: 'Las contraseñas no coinciden' });
    expect(servicioBase.cambiarContrasena).not.toHaveBeenCalled();
  });

  test('UT-001-7: delega el cambio de contraseña sin reenviar la confirmación', async () => {
    const resultado = await decorador.cambiarContrasena('user@test.com', '123456', '12345', '12345');
    expect(servicioBase.cambiarContrasena).toHaveBeenCalledWith('user@test.com', '123456', '12345');
    expect(resultado).toEqual({ exito: true });
  });
});

describe('ServicioAutenticacion - delegación de recuperación en UsuarioRepo', () => {
  test('UT-001-8: solicitarRecuperacion delega en usuarioRepo y retorna su resultado', async () => {
    const usuarioRepo = { solicitarRecuperacion: jest.fn().mockResolvedValue({ exito: true, mensaje: 'Código enviado' }) };
    const servicio = new ServicioAutenticacion({ notificar: jest.fn() }, usuarioRepo);

    const resultado = await servicio.solicitarRecuperacion('user@test.com');

    expect(usuarioRepo.solicitarRecuperacion).toHaveBeenCalledWith('user@test.com');
    expect(resultado).toEqual({ exito: true, mensaje: 'Código enviado' });
  });

  test('UT-001-9: cambiarContrasena delega los 3 argumentos correctos en usuarioRepo', async () => {
    const usuarioRepo = { cambiarContrasena: jest.fn().mockResolvedValue({ exito: true }) };
    const servicio = new ServicioAutenticacion({ notificar: jest.fn() }, usuarioRepo);

    await servicio.cambiarContrasena('user@test.com', '123456', 'nueva1');

    expect(usuarioRepo.cambiarContrasena).toHaveBeenCalledWith('user@test.com', '123456', 'nueva1');
  });
});
