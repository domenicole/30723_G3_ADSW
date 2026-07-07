import { UsuarioRepo } from '../datos/UsuarioRepo.js';

export class ServicioUsuarios {
  constructor(gestor, usuario, usuarioRepo) {
    this.gestor = gestor;
    this.usuario = usuario;
    this.usuarioRepo = usuarioRepo || new UsuarioRepo();
  }

  async obtenerUsuarios() {
    return this.usuarioRepo.listar();
  }

  async registrarUsuario(correo, password, perfilId) {
    const usuario = { id: Date.now(), correo, password, perfilId, estado: 'Activo' };
    await this.usuarioRepo.guardar(usuario);
    this.gestor.notificar({ tipo: 'USUARIO_REGISTRADO', datos: { ...usuario, password: undefined } });
    return { exito: true, mensaje: 'Usuario registrado' };
  }
}
