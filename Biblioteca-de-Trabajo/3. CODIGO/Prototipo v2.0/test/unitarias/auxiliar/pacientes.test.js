import { ValidacionDecorador } from '../../../src/negocio/ValidacionDecorador.js';
import { ServicioPacientes } from '../../../src/negocio/ServicioPacientes.js';

// REQ004 - Gestión de Pacientes (PP-FICITAS-2026-01, UT004-1 a UT004-14)
// Las funciones de validación (validarCedulaEcuatoriana, validarTextoSeguro, etc.) son internas
// de ValidacionDecorador.js, por lo que se ejercitan indirectamente vía registrarPaciente().

const CEDULA_VALIDA = '1710034065'; // provincia 17, dígito verificador correcto

function fechaISO(offsetDias = 0, offsetAnios = 0) {
  const fecha = new Date();
  fecha.setHours(0, 0, 0, 0);
  fecha.setDate(fecha.getDate() + offsetDias);
  fecha.setFullYear(fecha.getFullYear() + offsetAnios);
  return fecha.toISOString().slice(0, 10);
}

describe('ValidacionDecorador.registrarPaciente - validarCedulaEcuatoriana', () => {
  let servicioBase;
  let decorador;

  beforeEach(() => {
    servicioBase = { registrarPaciente: jest.fn().mockResolvedValue({ exito: true }) };
    decorador = new ValidacionDecorador(servicioBase);
  });

  test('UT004-1: cédula válida delega en servicioBase.registrarPaciente', async () => {
    await decorador.registrarPaciente(CEDULA_VALIDA, 'Juan Perez', 'M', '0987654321', 'juan@test.com', 'Correo', fechaISO(0, -30), 
    'Calle 1', 'Ingeniero', 'Soltero');
    expect(servicioBase.registrarPaciente).toHaveBeenCalled();
  });

  test('UT004-2: cédula con 9 dígitos es rechazada (valor límite de longitud)', async () => {
    const resultado = await decorador.registrarPaciente('171003406', 'Juan', 'M', '0987654321', 'juan@test.com', 'Correo', 
      fechaISO(0, -30), 'Calle 1', 'Ingeniero', 'Soltero');
    expect(resultado).toEqual({ exito: false, mensaje: 'La cédula ecuatoriana ingresada no es válida' });
  });

  test('UT004-3: provincia fuera de 1-24 es rechazada', async () => {
    const resultado = await decorador.registrarPaciente('9910034065', 'Juan', 'M', '0987654321', 'juan@test.com', 'Correo', fechaISO(0, -30), 'Calle 1', 'Ingeniero', 'Soltero');
    expect(resultado.exito).toBe(false);
  });

  test('UT004-4: tercer dígito > 5 (no persona natural) es rechazado', async () => {
    const resultado = await decorador.registrarPaciente('1761034065', 'Juan', 'M', '0987654321', 'juan@test.com', 'Correo', fechaISO(0, -30), 'Calle 1', 'Ingeniero', 'Soltero');
    expect(resultado.exito).toBe(false);
  });

  test('UT004-5: dígito verificador alterado es rechazado', async () => {
    const resultado = await decorador.registrarPaciente('1710034066', 'Juan', 'M', '0987654321', 'juan@test.com', 'Correo', fechaISO(0, -30), 'Calle 1', 'Ingeniero', 'Soltero');
    expect(resultado.exito).toBe(false);
  });
});

describe('ValidacionDecorador.registrarPaciente - validarTextoSeguro / validarTelefono / validarCorreo', () => {
  let servicioBase;
  let decorador;

  beforeEach(() => {
    servicioBase = { registrarPaciente: jest.fn().mockResolvedValue({ exito: true }) };
    decorador = new ValidacionDecorador(servicioBase);
  });

  test('UT004-6: nombre con <script> es rechazado por inyección', async () => {
    const resultado = await decorador.registrarPaciente(CEDULA_VALIDA, '<script>alert(1)</script>', 'M', '0987654321', 'juan@test.com', 'Correo', fechaISO(0, -30), 'Calle 1', 'Ingeniero', 'Soltero');
    expect(resultado).toEqual({ exito: false, mensaje: 'El nombre es inválido o contiene contenido no permitido' });
  });

  test('UT004-7: nombre vacío o solo espacios es rechazado', async () => {
    const resultado = await decorador.registrarPaciente(CEDULA_VALIDA, '   ', 'M', '0987654321', 'juan@test.com', 'Correo', fechaISO(0, -30), 'Calle 1', 'Ingeniero', 'Soltero');
    expect(resultado.exito).toBe(false);
  });

  test('UT004-8: teléfono con 9 dígitos es rechazado', async () => {
    const resultado = await decorador.registrarPaciente(CEDULA_VALIDA, 'Juan Perez', 'M', '098765432', 'juan@test.com', 'Correo', fechaISO(0, -30), 'Calle 1', 'Ingeniero', 'Soltero');
    expect(resultado).toEqual({ exito: false, mensaje: 'El teléfono debe tener 10 dígitos' });
  });

  test('UT004-9: correo sin TLD es rechazado', async () => {
    const resultado = await decorador.registrarPaciente(CEDULA_VALIDA, 'Juan Perez', 'M', '0987654321', 'usuario@dominio', 'Correo', fechaISO(0, -30), 'Calle 1', 'Ingeniero', 'Soltero');
    expect(resultado).toEqual({ exito: false, mensaje: 'El correo electrónico no es válido' });
  });
});

describe('ValidacionDecorador.registrarPaciente - validarFechaNacimiento', () => {
  let servicioBase;
  let decorador;

  beforeEach(() => {
    servicioBase = { registrarPaciente: jest.fn().mockResolvedValue({ exito: true }) };
    decorador = new ValidacionDecorador(servicioBase);
  });

  test('UT004-10: fecha de nacimiento futura (mañana) es rechazada', async () => {
    const resultado = await decorador.registrarPaciente(CEDULA_VALIDA, 'Juan Perez', 'M', '0987654321', 'juan@test.com', 'Correo', fechaISO(1), 'Calle 1', 'Ingeniero', 'Soltero');
    expect(resultado.exito).toBe(false);
    expect(resultado.mensaje).toMatch(/fecha de nacimiento no es válida/);
  });

  test('UT004-11: fecha de nacimiento a exactamente 120 años es aceptada (límite permitido)', async () => {
    const resultado = await decorador.registrarPaciente(CEDULA_VALIDA, 'Juan Perez', 'M', '0987654321', 'juan@test.com', 'Correo', fechaISO(0, -120), 'Calle 1', 'Ingeniero', 'Soltero');
    expect(servicioBase.registrarPaciente).toHaveBeenCalled();
    expect(resultado.exito).toBe(true);
  });

  test('UT004-12: fecha de nacimiento a 121 años es rechazada', async () => {
    const resultado = await decorador.registrarPaciente(CEDULA_VALIDA, 'Juan Perez', 'M', '0987654321', 'juan@test.com', 'Correo', fechaISO(0, -121), 'Calle 1', 'Ingeniero', 'Soltero');
    expect(resultado.exito).toBe(false);
  });
});

describe('ServicioPacientes.cambiarEstado', () => {
  test('UT004-13: actualiza el estado cuando el paciente existe', async () => {
    const pacienteActualizado = { id: 1, estado: 'Inactivo' };
    const pacienteRepo = { actualizar: jest.fn().mockResolvedValue(pacienteActualizado) };
    const servicio = new ServicioPacientes(pacienteRepo);

    const resultado = await servicio.cambiarEstado(1, 'Inactivo');

    expect(pacienteRepo.actualizar).toHaveBeenCalledWith(1, { estado: 'Inactivo' });
    expect(resultado).toEqual({ exito: true, mensaje: 'Estado actualizado', paciente: pacienteActualizado });
  });

  test('UT004-14: retorna error cuando el paciente no existe', async () => {
    const pacienteRepo = { actualizar: jest.fn().mockResolvedValue(null) };
    const servicio = new ServicioPacientes(pacienteRepo);

    const resultado = await servicio.cambiarEstado(999, 'Inactivo');

    expect(resultado).toEqual({ exito: false, mensaje: 'Paciente no encontrado' });
  });
});

describe('ServicioPacientes - registro y modificación (cobertura adicional)', () => {
  test('registrarPaciente construye el paciente y lo persiste', async () => {
    const pacienteRepo = { guardar: jest.fn().mockResolvedValue(true) };
    const servicio = new ServicioPacientes(pacienteRepo);

    const resultado = await servicio.registrarPaciente(CEDULA_VALIDA, 'Juan Perez', 'M', '0987654321', 'juan@test.com', 'Correo', fechaISO(0, -30), 'Calle 1', 'Ingeniero', 'Soltero');

    expect(pacienteRepo.guardar).toHaveBeenCalledTimes(1);
    expect(resultado.exito).toBe(true);
    expect(resultado.paciente.cedula).toBe(CEDULA_VALIDA);
  });

  test('modificarPaciente retorna error cuando el paciente no existe', async () => {
    const pacienteRepo = { actualizar: jest.fn().mockResolvedValue(null) };
    const servicio = new ServicioPacientes(pacienteRepo);

    const resultado = await servicio.modificarPaciente(999, 'Calle 2', '0987654321', 'juan@test.com', 'Correo', 'Ingeniero', 'Soltero');

    expect(resultado).toEqual({ exito: false, mensaje: 'Paciente no encontrado' });
  });
});
