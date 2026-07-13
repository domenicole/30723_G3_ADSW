import { UsuarioRepo } from '../datos/UsuarioRepo.js';

export class ServicioAutenticacion {
  constructor(gestor, usuarioRepo) {
    this.gestor = gestor;
    this.usuarioRepo = usuarioRepo || new UsuarioRepo();
  }

  async iniciarSesion(correo, pass) {
    const resultado = await this.usuarioRepo.login(correo, pass);
    if (!resultado.exito) {
      return { exito: false, mensaje: resultado.mensaje || 'Credenciales inválidas' };
    }

    this.gestor.notificar({ tipo: 'LOGIN', datos: { usuario: resultado.usuario, perfil: resultado.perfil } });
    return { exito: true, usuario: resultado.usuario, perfil: resultado.perfil };
  }

  async solicitarRecuperacion(correo) {
    return this.usuarioRepo.solicitarRecuperacion(correo);
  }

  async verificarCodigoRecuperacion(correo, codigo) {
    return this.usuarioRepo.verificarCodigoRecuperacion(correo, codigo);
  }

  async cambiarContrasena(correo, codigo, nuevaContrasena) {
    return this.usuarioRepo.cambiarContrasena(correo, codigo, nuevaContrasena);
  }
}
