import { ServicioAutenticacion } from '../negocio/ServicioAutenticacion.js';
import { ValidacionDecorador } from '../negocio/ValidacionDecorador.js';

export class VistaRecuperarContrasena {
  constructor(gestor, authSvc) {
    this.gestor = gestor;
    this.authSvc = authSvc || new ValidacionDecorador(new ServicioAutenticacion(gestor, window.appState?.usuarioRepo));
    this.codigoGenerado = '';
    this.correoActual = '';
    this.render();
  }

  render() {
    const container = document.getElementById('app');
    container.innerHTML = `
      <div class="auth-screen">
        <div class="auth-card">
          <h1>FiCitas</h1>
          <p>Recuperar contraseña</p>
          <form id="formRecuperar" class="auth-form">
            <label>Correo<input id="correoRecuperar" type="email" required /></label>
            <button class="primary-btn" type="submit">Generar código</button>
            <button id="btnVolverLogin" class="secondary-btn" type="button">Volver</button>
          </form>
          <form id="formVerificar" class="auth-form" style="display:none; margin-top: 16px;">
            <label>Código de 6 dígitos<input id="codigoVerificacion" maxlength="6" inputmode="numeric" required /></label>
            <button class="primary-btn" type="submit">Verificar código</button>
          </form>
          <form id="formCambiar" class="auth-form" style="display:none; margin-top: 16px;">
            <label>Nueva contraseña<input id="nuevaContrasena" type="password" required /></label>
            <label>Confirmar contraseña<input id="confirmarContrasena" type="password" required /></label>
            <button class="primary-btn" type="submit">Cambiar contraseña</button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('formRecuperar').addEventListener('submit', (e) => this.generarCodigo(e));
    document.getElementById('formVerificar').addEventListener('submit', (e) => this.verificarCodigo(e));
    document.getElementById('formCambiar').addEventListener('submit', (e) => this.cambiarContrasena(e));
    document.getElementById('btnVolverLogin').addEventListener('click', () => this.volverLogin());
  }

  async generarCodigo(e) {
    e.preventDefault();
    const correo = document.getElementById('correoRecuperar').value;
    const res = await this.authSvc.solicitarRecuperacion(correo);
    alert(res.mensaje);

    if (!res.exito) return;

    this.correoActual = correo;
    this.codigoGenerado = res.codigo;
    document.getElementById('formVerificar').style.display = 'grid';
  }

  async verificarCodigo(e) {
    e.preventDefault();
    const codigo = document.getElementById('codigoVerificacion').value;
    const res = await this.authSvc.verificarCodigoRecuperacion(this.correoActual, codigo);
    alert(res.mensaje);

    if (!res.exito) return;

    document.getElementById('formCambiar').style.display = 'grid';
  }

  async cambiarContrasena(e) {
    e.preventDefault();
    const nuevaContrasena = document.getElementById('nuevaContrasena').value;
    const confirmarContrasena = document.getElementById('confirmarContrasena').value;
    const res = await this.authSvc.cambiarContrasena(this.correoActual, document.getElementById('codigoVerificacion').value, nuevaContrasena, confirmarContrasena);
    alert(res.mensaje);

    if (res.exito) {
      this.volverLogin();
    }
  }

  volverLogin() {
    import('./VistaLogin.js').then(({ VistaLogin }) => new VistaLogin(this.gestor));
  }
}
