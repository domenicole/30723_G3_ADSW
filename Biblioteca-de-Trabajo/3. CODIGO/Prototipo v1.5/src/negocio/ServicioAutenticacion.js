export class ServicioAutenticacion {
  constructor(gestor) {
    this.gestor = gestor;
  }

  iniciarSesion(correo, pass) {
    const usuarios = [
      { correo: 'admin@ficitas.com', password: '12345', perfil: 'Administrador' },
      { correo: 'auxiliar@ficitas.com', password: '12345', perfil: 'Auxiliar' }
    ];

    const usuario = usuarios.find((u) => u.correo === correo && u.password === pass);
    if (!usuario) {
      return { exito: false, mensaje: 'Credenciales inválidas' };
    }

    this.gestor.notificar({ tipo: 'LOGIN', datos: { correo } });
    return { exito: true, usuario: { correo }, perfil: { nombre: usuario.perfil } };
  }
}
