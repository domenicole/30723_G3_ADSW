import { PerfilRepo } from '../datos/PerfilRepo.js';

export class ServicioPerfiles {
  constructor(gestor, usuario, perfil, perfilRepo) {
    this.gestor = gestor;
    this.usuario = usuario;
    this.perfil = perfil;
    this.perfilRepo = perfilRepo || new PerfilRepo();
  }

  async obtenerPerfiles() {
    return this.perfilRepo.listar();
  }

  async registrarPerfil(nombre, descripcion, permisos) {
    const perfil = { id: Date.now(), nombre, descripcion, estado: 'Activo', permisos };
    await this.perfilRepo.guardar(perfil);
    this.gestor.notificar({ tipo: 'PERFIL_REGISTRADO', datos: perfil });
    return { exito: true, mensaje: 'Perfil registrado' };
  }

  async modificarPerfil(id, nombre, descripcion, estado, permisos) {
    const perfil = await this.perfilRepo.actualizar(id, { nombre, descripcion, estado, permisos });
    if (!perfil) {
      return { exito: false, mensaje: 'Perfil no encontrado' };
    }
    return { exito: true, mensaje: 'Perfil actualizado' };
  }
}
