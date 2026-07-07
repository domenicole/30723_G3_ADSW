export class ServicioPerfiles {
  constructor(gestor, usuario, perfil) {
    this.gestor = gestor;
    this.usuario = usuario;
    this.perfil = perfil;
    this.perfiles = [];
  }

  obtenerPerfiles() {
    return this.perfiles;
  }

  registrarPerfil(nombre, descripcion, permisos) {
    const perfil = { id: Date.now(), nombre, descripcion, estado: 'Activo', permisos };
    this.perfiles.push(perfil);
    this.gestor.notificar({ tipo: 'PERFIL_REGISTRADO', datos: perfil });
    return { exito: true, mensaje: 'Perfil registrado' };
  }

  modificarPerfil(id, nombre, descripcion, estado, permisos) {
    const perfil = this.perfiles.find((item) => item.id === id);
    if (!perfil) {
      return { exito: false, mensaje: 'Perfil no encontrado' };
    }
    perfil.nombre = nombre;
    perfil.descripcion = descripcion;
    perfil.estado = estado;
    perfil.permisos = permisos;
    return { exito: true, mensaje: 'Perfil actualizado' };
  }
}
