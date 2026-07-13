import { PerfilRepo } from '../datos/PerfilRepo.js';
import { Perfil } from '../modelos/Perfil.js';
import { Evento } from './Evento.js';

export class ServicioPerfiles {
  constructor(gestor, usuario, perfil, perfilRepo) {
    this.gestor = gestor;
    this.usuario = usuario || (typeof window !== 'undefined' ? window.appState?.currentUser : null);
    this.perfil = perfil || (typeof window !== 'undefined' ? window.appState?.currentProfile : null);
    this.perfilRepo = perfilRepo || new PerfilRepo();
  }

  async obtenerPerfiles() {
    return this.perfilRepo.listar();
  }

  async obtenerPerfilPorId(id) {
    if (typeof this.perfilRepo.obtenerPorId !== 'function') return null;
    return this.perfilRepo.obtenerPorId(id);
  }

  normalizarCadena(valor) {
    return typeof valor === 'string' ? valor.trim() : '';
  }

  normalizarPermisos(permisos) {
    if (!Array.isArray(permisos)) return [];
    return permisos.map((permiso) => this.normalizarCadena(permiso)).filter(Boolean);
  }

  esPerfilAdministrador(perfil) {
    return this.normalizarCadena(perfil?.nombre).toLowerCase() === 'administrador';
  }

  async registrarPerfil(datosPerfil) {
    const { nombre, descripcion, estado = 'Activo', permisos = [] } = datosPerfil || {};
    const nombreLimpio = this.normalizarCadena(nombre);
    const descripcionLimpia = this.normalizarCadena(descripcion);
    const permisosLimpios = this.normalizarPermisos(permisos);

    if (!nombreLimpio) {
      return { exito: false, mensaje: 'El nombre del perfil es obligatorio' };
    }
    if (!descripcionLimpia) {
      return { exito: false, mensaje: 'La descripción del perfil es obligatoria' };
    }
    if (permisosLimpios.length === 0) {
      return { exito: false, mensaje: 'Debe seleccionar al menos un permiso' };
    }

    const perfiles = await this.obtenerPerfiles();
    const nombreDuplicado = perfiles.some((perfil) => this.normalizarCadena(perfil.nombre).toLowerCase() === nombreLimpio.toLowerCase());
    if (nombreDuplicado) {
      return { exito: false, mensaje: 'Ya existe un perfil con ese nombre' };
    }

    const perfil = new Perfil({
      id: Date.now(),
      nombre: nombreLimpio,
      descripcion: descripcionLimpia,
      estado,
      permisos: permisosLimpios,
    });

    await this.perfilRepo.guardar(perfil);
    this.notificarEvento('PERFIL_REGISTRADO', null, perfil);
    return { exito: true, mensaje: 'Perfil registrado', perfil };
  }

  async modificarPerfil(id, datosPerfil) {
    const { nombre, descripcion, estado = 'Activo', permisos = [] } = datosPerfil || {};
    const idNumerico = Number(id);
    const nombreLimpio = this.normalizarCadena(nombre);
    const descripcionLimpia = this.normalizarCadena(descripcion);
    const permisosLimpios = this.normalizarPermisos(permisos);

    const perfiles = await this.obtenerPerfiles();
    const perfilActual = perfiles.find((perfil) => Number(perfil.id) === idNumerico);
    if (!perfilActual) {
      return { exito: false, mensaje: 'Perfil no encontrado' };
    }

    if (!nombreLimpio) {
      return { exito: false, mensaje: 'El nombre del perfil es obligatorio' };
    }
    if (!descripcionLimpia) {
      return { exito: false, mensaje: 'La descripción del perfil es obligatoria' };
    }
    if (permisosLimpios.length === 0) {
      return { exito: false, mensaje: 'Debe seleccionar al menos un permiso' };
    }

    const nombreDuplicado = perfiles.some((perfil) => Number(perfil.id) !== idNumerico && this.normalizarCadena(perfil.nombre).toLowerCase() === nombreLimpio.toLowerCase());
    if (nombreDuplicado) {
      return { exito: false, mensaje: 'Ya existe un perfil con ese nombre' };
    }

    if (estado === 'Inactivo' && this.esPerfilAdministrador(perfilActual)) {
      const administradoresActivos = perfiles.filter((perfil) => this.esPerfilAdministrador(perfil) && perfil.estado === 'Activo');
      if (administradoresActivos.length <= 1) {
        return { exito: false, mensaje: 'No se puede desactivar el único perfil administrador activo' };
      }
    }

    const perfilActualizado = new Perfil({
      ...perfilActual,
      nombre: nombreLimpio,
      descripcion: descripcionLimpia,
      estado,
      permisos: permisosLimpios,
    });

    const resultado = await this.perfilRepo.actualizar(idNumerico, perfilActualizado);
    if (!resultado) {
      return { exito: false, mensaje: 'Perfil no encontrado' };
    }

    this.notificarEvento('PERFIL_ACTUALIZADO', perfilActual, perfilActualizado);
    return { exito: true, mensaje: 'Perfil actualizado', perfil: perfilActualizado };
  }

  notificarEvento(tipo, anteriores, modificados) {
    const contexto = {
      usuario: this.usuario || (typeof window !== 'undefined' ? window.appState?.currentUser : null),
      perfil: this.perfil || (typeof window !== 'undefined' ? window.appState?.currentProfile : null),
      anteriores,
      modificados,
    };

    if (!this.gestor) return;
    this.gestor.notificar(new Evento(tipo, contexto));
  }
}
