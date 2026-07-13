const PATRONES_SCRIPT = [/<[^>]*>/, /javascript\s*:/i, /on\w+\s*=/i];

function contieneScript(valor) {
  if (typeof valor !== 'string') return false;
  return PATRONES_SCRIPT.some((patron) => patron.test(valor));
}

function validarCedulaEcuatoriana(cedula) {
  if (typeof cedula !== 'string' || !/^\d{10}$/.test(cedula)) return false;
  const digitos = cedula.split('').map(Number);
  const provincia = Number(cedula.slice(0, 2));
  if (provincia < 1 || provincia > 24) return false;
  if (digitos[2] > 5) return false;

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const suma = coeficientes.reduce((acumulado, coeficiente, i) => {
    let valor = digitos[i] * coeficiente;
    if (valor > 9) valor -= 9;
    return acumulado + valor;
  }, 0);
  const residuo = suma % 10;
  const digitoVerificador = residuo === 0 ? 0 : 10 - residuo;
  return digitoVerificador === digitos[9];
}

function validarTelefono(telefono) {
  return typeof telefono === 'string' && /^\d{10}$/.test(telefono);
}

function validarCorreo(correo) {
  return typeof correo === 'string' && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(correo);
}

function validarFechaNacimiento(fechaStr) {
  if (typeof fechaStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) return false;
  const fecha = new Date(`${fechaStr}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return false;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fecha > hoy) return false;

  const edadMaxima = new Date(hoy);
  edadMaxima.setFullYear(edadMaxima.getFullYear() - 120);
  if (fecha < edadMaxima) return false;

  return true;
}

function validarTextoSeguro(valor) {
  return typeof valor === 'string' && valor.trim().length > 0 && !contieneScript(valor);
}

export class ValidacionDecorador {
  constructor(servicioBase) {
    this.servicioBase = servicioBase;
  }

  async obtenerPacientes() {
    return this.servicioBase.obtenerPacientes();
  }

  async registrarPaciente(cedula, nombre, sexo, telefono, correo, canalPreferido, fecha, domicilio, ocupacion, estadoCivil) {
    if (!validarCedulaEcuatoriana(cedula)) {
      return { exito: false, mensaje: 'La cédula ecuatoriana ingresada no es válida' };
    }
    if (!validarTextoSeguro(nombre)) {
      return { exito: false, mensaje: 'El nombre es inválido o contiene contenido no permitido' };
    }
    if (!validarTextoSeguro(sexo)) {
      return { exito: false, mensaje: 'El sexo es inválido o contiene contenido no permitido' };
    }
    if (!validarTelefono(telefono)) {
      return { exito: false, mensaje: 'El teléfono debe tener 10 dígitos' };
    }
    if (!validarCorreo(correo)) {
      return { exito: false, mensaje: 'El correo electrónico no es válido' };
    }
    if (!validarFechaNacimiento(fecha)) {
      return { exito: false, mensaje: 'La fecha de nacimiento no es válida (no puede ser futura ni excesivamente antigua)' };
    }
    if (!validarTextoSeguro(domicilio)) {
      return { exito: false, mensaje: 'El domicilio es inválido o contiene contenido no permitido' };
    }
    if (!validarTextoSeguro(ocupacion)) {
      return { exito: false, mensaje: 'La ocupación es inválida o contiene contenido no permitido' };
    }

    return this.servicioBase.registrarPaciente(cedula, nombre, sexo, telefono, correo, canalPreferido, fecha, domicilio, ocupacion, estadoCivil);
  }

  async modificarPaciente(id, domicilio, telefono, correo, canalPreferido, ocupacion, estadoCivil) {
    if (!validarTelefono(telefono)) {
      return { exito: false, mensaje: 'El teléfono debe tener 10 dígitos' };
    }
    if (!validarCorreo(correo)) {
      return { exito: false, mensaje: 'El correo electrónico no es válido' };
    }
    if (!validarTextoSeguro(domicilio)) {
      return { exito: false, mensaje: 'El domicilio es inválido o contiene contenido no permitido' };
    }
    if (!validarTextoSeguro(ocupacion)) {
      return { exito: false, mensaje: 'La ocupación es inválida o contiene contenido no permitido' };
    }

    return this.servicioBase.modificarPaciente(id, domicilio, telefono, correo, canalPreferido, ocupacion, estadoCivil);
  }

  async cambiarEstado(id, nuevoEstado) {
    return this.servicioBase.cambiarEstado(id, nuevoEstado);
  }

  async iniciarSesion(correo, pass) {
    if (contieneScript(correo) || contieneScript(pass)) {
      return { exito: false, mensaje: 'La entrada contiene contenido no permitido' };
    }
    if (!validarCorreo(correo)) {
      return { exito: false, mensaje: 'El correo electrónico no es válido' };
    }
    if (typeof pass !== 'string' || pass.length === 0) {
      return { exito: false, mensaje: 'La contraseña es requerida' };
    }

    return this.servicioBase.iniciarSesion(correo, pass);
  }

  async solicitarRecuperacion(correo) {
    if (contieneScript(correo) || !validarCorreo(correo)) {
      return { exito: false, mensaje: 'El correo electrónico no es válido' };
    }
    return this.servicioBase.solicitarRecuperacion(correo);
  }

  async verificarCodigoRecuperacion(correo, codigo) {
    if (!validarCorreo(correo)) {
      return { exito: false, mensaje: 'El correo electrónico no es válido' };
    }
    if (typeof codigo !== 'string' || !/^\d{6}$/.test(codigo)) {
      return { exito: false, mensaje: 'El código debe contener 6 dígitos' };
    }
    return this.servicioBase.verificarCodigoRecuperacion(correo, codigo);
  }

  async cambiarContrasena(correo, codigo, nuevaContrasena, confirmarContrasena) {
    if (!validarCorreo(correo)) {
      return { exito: false, mensaje: 'El correo electrónico no es válido' };
    }
    if (typeof codigo !== 'string' || !/^\d{6}$/.test(codigo)) {
      return { exito: false, mensaje: 'El código debe contener 6 dígitos' };
    }
    if (typeof nuevaContrasena !== 'string' || nuevaContrasena.length < 5) {
      return { exito: false, mensaje: 'La nueva contraseña debe tener al menos 5 caracteres' };
    }
    if (nuevaContrasena !== confirmarContrasena) {
      return { exito: false, mensaje: 'Las contraseñas no coinciden' };
    }
    return this.servicioBase.cambiarContrasena(correo, codigo, nuevaContrasena);
  }
}
