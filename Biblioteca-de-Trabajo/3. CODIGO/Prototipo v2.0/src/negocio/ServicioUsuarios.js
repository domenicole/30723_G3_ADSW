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

  async registrarUsuario(username, correo, password, perfilId) {
    const perfilIdNumerico = Number(perfilId);
    // Para soportar perfiles de tipo ObjectId lo mandamos directo en perfilId en el backend
    const usuario = { id: Date.now(), username, correo, password, perfilId, estado: 'Activo' };
    await this.usuarioRepo.guardar(usuario);
    this.gestor.notificar({ tipo: 'USUARIO_REGISTRADO', datos: { ...usuario, password: undefined } });
    return { exito: true, mensaje: 'Usuario registrado' };
  }

  async modificarUsuario(id, datos) {
    const res = await this.usuarioRepo.modificarUsuario(id, datos);
    if (res.exito) {
      this.gestor.notificar({ tipo: 'USUARIO_MODIFICADO', datos: { id, ...datos } });
    }
    return res;
  }
}
