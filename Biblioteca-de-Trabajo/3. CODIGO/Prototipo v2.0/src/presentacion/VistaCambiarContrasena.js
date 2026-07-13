import { ServicioAutenticacion } from '../negocio/ServicioAutenticacion.js';
import { ValidacionDecorador } from '../negocio/ValidacionDecorador.js';

export class VistaCambiarContrasena {
  constructor(gestor, authSvc, correo = '', codigo = '') {
    this.gestor = gestor;
    this.authSvc = authSvc || new ValidacionDecorador(new ServicioAutenticacion(gestor, window.appState?.usuarioRepo));
    this.correo = correo;
    this.codigo = codigo;
    this.render();
  }

  render() {
    const container = document.getElementById('app');
    container.innerHTML = `
      <div class="auth-screen">
        <div class="auth-card">
          <h1>FiCitas</h1>
          <p>Cambiar contraseña</p>
          <form id="formCambio" class="auth-form">
            <label>Correo<input id="correoCambio" type="email" value="${this.correo}" required /></label>
            <label>Código<input id="codigoCambio" maxlength="6" value="${this.codigo}" required /></label>
            <label>Nueva contraseña<input id="nuevaContrasena" type="password" required /></label>
            <label>Confirmar contraseña<input id="confirmarContrasena" type="password" required /></label>
            <button class="primary-btn" type="submit">Cambiar</button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('formCambio').addEventListener('submit', (e) => this.cambiar(e));
  }

  async cambiar(e) {
    e.preventDefault();
    const correo = document.getElementById('correoCambio').value;
    const codigo = document.getElementById('codigoCambio').value;
    const nuevaContrasena = document.getElementById('nuevaContrasena').value;
    const confirmarContrasena = document.getElementById('confirmarContrasena').value;

    const res = await this.authSvc.cambiarContrasena(correo, codigo, nuevaContrasena, confirmarContrasena);
    alert(res.mensaje);
    if (res.exito) {
      import('./VistaLogin.js').then(({ VistaLogin }) => new VistaLogin(this.gestor));
    }
  }
}
