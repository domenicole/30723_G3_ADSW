export class ServicioUsuarios {
  constructor(gestor, usuario) {
    this.gestor = gestor;
    this.usuario = usuario;
    this.usuarios = [];
  }

  obtenerUsuarios() {
    return this.usuarios;
  }

  registrarUsuario(correo, password, perfilId) {
    const usuario = { id: Date.now(), correo, password, perfilId, estado: 'Activo' };
    this.usuarios.push(usuario);
    this.gestor.notificar({ tipo: 'USUARIO_REGISTRADO', datos: usuario });
    return { exito: true, mensaje: 'Usuario registrado' };
  }
}
