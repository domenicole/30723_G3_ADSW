import { ValidacionDecorador } from '../negocio/ValidacionDecorador.js';
import { ServicioPacientes } from '../negocio/ServicioPacientes.js';
import { VistaCitas } from './VistaCitas.js';

export class VistaPacientes {
  constructor(gestor) {
    this.gestor = gestor;
    const pacienteRepo = window.appState?.pacienteRepo;
    this.svcDecorado = new ValidacionDecorador(new ServicioPacientes(pacienteRepo));
    this.render();
  }

  render() {
    const container = document.getElementById('app');
    container.innerHTML = `
      <div class="dashboard-shell">
        <aside class="sidebar">
          <h2>FiCitas</h2>
          <p>Panel de auxiliar</p>
          <button class="menu-btn active" data-view="pacientes">Pacientes</button>
          <button class="menu-btn" data-view="citas">Citas</button>
          <button id="btnCerrarSesion" class="logout-btn">   
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 17l1.41-1.41L8.83 13H20v-2H8.83l2.58-2.59L10 7l-5 5 5 5zm10-14H12v2h8v14h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg> Cerrar sesión</button>
        </aside>
        <main class="main-panel">
          <section id="pacientes" class="view-card active">
            <h3>Gestión de pacientes</h3>
            <form id="formPaciente" class="form-grid">
              <input id="idPaciente" type="hidden" />
              <label>Cédula<input id="cedula" maxlength="10" required /></label>
              <label>Nombre<input id="nombre" required /></label>
              <label>Teléfono<input id="telefono" maxlength="10" required /></label>
              <label>Correo<input id="correo" type="email" required /></label>
              <label>Canal preferido<select id="canalPreferido"><option value="WhatsApp">WhatsApp</option><option value="Correo">Correo</option></select></label>
              <label>Fecha Nac.<input id="fecha" type="date" required /></label>
              <label>Domicilio<input id="domicilio" required /></label>
              <label>Ocupación<input id="ocupacion" required /></label>
              <label>Estado Civil<select id="estadoCivil"><option>Soltero</option><option>Casado</option><option>Divorciado</option><option>Viudo</option><option>Unión Libre</option></select></label>
              <button class="primary-btn" type="submit">Guardar</button>
            </form>
            <div id="panelAvisos" class="panel-aviso"></div>
            <table>
              <thead><tr><th>Cédula</th><th>Nombre</th><th>Teléfono</th><th>Correo</th><th>Canal</th><th>Estado</th></tr></thead>
              <tbody id="tablaPacientes"></tbody>
            </table>
          </section>
          <section id="citas" class="view-card">
            <div id="citasContainer"></div>
          </section>
        </main>
      </div>
    `;

    document.getElementById('formPaciente').addEventListener('submit', (e) => this.guardar(e));
    document.querySelectorAll('.menu-btn').forEach((btn) => btn.addEventListener('click', () => this.cambiarVista(btn.dataset.view)));
    document.getElementById('btnCerrarSesion').addEventListener('click', () => this.cerrarSesion());
    this.cargarTabla();
    new VistaCitas(this.gestor).render();
  }

  cerrarSesion() {
    this.gestor.notificar({ tipo: 'LOGOUT', datos: {} });
    import('./VistaLogin.js').then(({ VistaLogin }) => new VistaLogin(this.gestor));
  }

  cambiarVista(vista) {
    document.querySelectorAll('.view-card').forEach((card) => card.classList.toggle('active', card.id === vista));
    document.querySelectorAll('.menu-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.view === vista));
  }

  async cargarTabla() {
    const tbody = document.getElementById('tablaPacientes');
    tbody.innerHTML = '';
    const pacientes = await this.svcDecorado.obtenerPacientes();
    pacientes.forEach((p) => {
      const fila = document.createElement('tr');
      fila.innerHTML = `<td>${p.cedula}</td><td>${p.nombre}</td><td>${p.telefono}</td><td>${p.correo || ''}</td><td>${p.canalPreferido || ''}</td><td>${p.estado}</td>`;
      tbody.appendChild(fila);
    });
  }

  async guardar(e) {
    e.preventDefault();
    const cedula = document.getElementById('cedula').value;
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const correo = document.getElementById('correo').value;
    const canalPreferido = document.getElementById('canalPreferido').value;
    const fecha = document.getElementById('fecha').value;
    const domicilio = document.getElementById('domicilio').value;
    const ocupacion = document.getElementById('ocupacion').value;
    const estadoCivil = document.getElementById('estadoCivil').value;
    const res = await this.svcDecorado.registrarPaciente(cedula, nombre, telefono, correo, canalPreferido, fecha, domicilio, ocupacion, estadoCivil);
    alert(res.mensaje);
    if (res.exito) {
      this.render();
    }
  }
}
