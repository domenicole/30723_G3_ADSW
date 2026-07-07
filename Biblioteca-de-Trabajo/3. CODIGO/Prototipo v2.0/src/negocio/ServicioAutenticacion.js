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

    this.gestor.notificar({ tipo: 'LOGIN', datos: { correo } });
    return { exito: true, usuario: resultado.usuario, perfil: resultado.perfil };
  }
}
