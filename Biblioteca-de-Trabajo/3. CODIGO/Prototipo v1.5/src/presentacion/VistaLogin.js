import { ServicioAutenticacion } from '../negocio/ServicioAutenticacion.js';

export class VistaLogin {
  constructor(gestor) {
    this.gestor = gestor;
    this.authSvc = new ServicioAutenticacion(gestor);
    this.render();
  }

  render() {
    const container = document.getElementById('app');
    container.innerHTML = `
      <div class="auth-screen">
        <div class="auth-card">
          <h1>FiCitas</h1>
          <p>Iniciar sesión</p>
          <form id="loginForm" class="auth-form">
            <label>Correo<input id="correo" type="email" required /></label>
            <label>Contraseña<input id="password" type="password" required /></label>
            <button class="primary-btn" type="submit">Ingresar</button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', (e) => this.ingresar(e));
  }

  ingresar(e) {
    e.preventDefault();
    const correo = document.getElementById('correo').value;
    const pass = document.getElementById('password').value;
    const res = this.authSvc.iniciarSesion(correo, pass);

    if (res.exito) {
      alert(`Bienvenido ${res.usuario.correo}`);
      if (res.perfil.nombre === 'Administrador') {
        this.showVistaPerfiles();
      } else {
        this.showVistaPacientes();
      }
    } else {
      alert(res.mensaje);
    }
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
}
