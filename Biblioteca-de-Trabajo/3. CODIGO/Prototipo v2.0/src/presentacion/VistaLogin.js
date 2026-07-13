import { ServicioAutenticacion } from '../negocio/ServicioAutenticacion.js';
import { ValidacionDecorador } from '../negocio/ValidacionDecorador.js';

export class VistaLogin {
  constructor(gestor) {
    this.gestor = gestor;
    this.authSvc = new ValidacionDecorador(new ServicioAutenticacion(gestor, window.appState?.usuarioRepo));
    this.render();
  }

  render() {
    const container = document.getElementById('app');
    container.innerHTML = `
      <div class="auth-screen">
        <div class="auth-card">
          <h1>FiCitas</h1>
          <p>Iniciar sesión (Actualizado)</p>
          <form id="loginForm" class="auth-form">
            <label>Correo o Username<input id="correo" type="text" required /></label>
            <label>Contraseña<input id="password" type="password" required /></label>
            <button class="primary-btn" type="submit">Ingresar</button>
            <button id="btnRecuperar" class="secondary-btn" type="button">Recuperar contraseña</button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', (e) => this.ingresar(e));
    document.getElementById('btnRecuperar').addEventListener('click', () => this.showVistaRecuperarContrasena());
  }

  async ingresar(e) {
    e.preventDefault();
    const correo = document.getElementById('correo').value;
    const pass = document.getElementById('password').value;
    const res = await this.authSvc.iniciarSesion(correo, pass);

    if (res.exito) {
      window.appState.currentUser = res.usuario;
      window.appState.currentProfile = res.perfil;
      window.appState.permisosActuales = Array.isArray(res.perfil?.permisos) ? res.perfil.permisos : [];

      const perfilNombre = (res.perfil?.nombre || '').trim().toLowerCase();
      
      if (!res.perfil) {
        alert(`Bienvenido ${res.usuario.correo}\n\n⚠️ ADVERTENCIA: Tu usuario NO tiene un perfil válido asignado en la base de datos. Se mostrará la vista por defecto (Auxiliar).`);
      } else {
        alert(`Bienvenido ${res.usuario.correo}\nPerfil detectado: ${res.perfil.nombre}`);
      }

      if (this.esAdministrador(res.perfil)) {
        this.showVistaPerfiles();
      } else if (perfilNombre === 'fisioterapeuta') {
        this.showVistaPlanificacion();
      } else {
        // Auxiliar y otros
        this.showVistaPacientes();
      }
    } else {
      alert(res.mensaje);
    }
  }

  esAdministrador(perfil) {
    const nombre = (perfil?.nombre || '').trim().toLowerCase();
    return nombre === 'administrador' || (Array.isArray(perfil?.permisos) && perfil.permisos.includes('GESTION_PERFILES'));
  }

  showVistaPerfiles() {
    import('./VistaPerfiles.js').then(({ VistaPerfiles }) => {
      new VistaPerfiles(this.gestor);
    });
  }

  showVistaPacientes() {
    import('./VistaPacientes.js').then(({ VistaPacientes }) => {
      new VistaPacientes(this.gestor);
    });
  }

  showVistaPlanificacion() {
    import('./VistaPlanificacion.js').then(({ VistaPlanificacion }) => {
      const vista = new VistaPlanificacion(this.gestor, window.appState.currentUser);
      vista.render();
    });
  }

  showVistaRecuperarContrasena() {
    import('./VistaRecuperarContrasena.js').then(({ VistaRecuperarContrasena }) => {
      new VistaRecuperarContrasena(this.gestor, this.authSvc);
    });
  }
}
