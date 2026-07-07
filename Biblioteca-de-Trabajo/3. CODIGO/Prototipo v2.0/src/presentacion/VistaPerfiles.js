import { ServicioPerfiles } from '../negocio/ServicioPerfiles.js';
import { ServicioUsuarios } from '../negocio/ServicioUsuarios.js';

export class VistaPerfiles {
  constructor(gestor) {
    this.gestor = gestor;
    this.svcPerfiles = new ServicioPerfiles(gestor, null, null, window.appState?.perfilRepo);
    this.svcUsuarios = new ServicioUsuarios(gestor, null, window.appState?.usuarioRepo);
    this.render();
  }

  render() {
    const container = document.getElementById('app');
    container.innerHTML = `
      <div class="dashboard-shell">
        <aside class="sidebar">
          <h2>FiCitas</h2>
          <p>Panel de administrador</p>
          <button class="menu-btn active" data-view="perfiles">Perfiles</button>
          <button class="menu-btn" data-view="usuarios">Usuarios</button>
          <button class="menu-btn" data-view="planificacion">Planificación</button>
          <button id="btnCerrarSesion" class="logout-btn">Cerrar sesión</button>
        </aside>
        <main class="main-panel">
          <section id="perfiles" class="view-card active">
            <h3>Gestión de perfiles</h3>
            <form id="formPerfil" class="form-grid">
              <label>Nombre<input id="nombrePerfil" required /></label>
              <label>Descripción<input id="descripcionPerfil" required /></label>
              <label>Estado<select id="estadoPerfil"><option>Activo</option><option>Inactivo</option></select></label>
              <button class="primary-btn" type="submit">Guardar</button>
            </form>
            <table>
              <thead><tr><th>Nombre</th><th>Estado</th></tr></thead>
              <tbody id="tablaPerfiles"></tbody>
            </table>
          </section>
          <section id="usuarios" class="view-card">
            <h3>Gestión de usuarios</h3>
            <form id="formUsuario" class="form-grid">
              <label>Correo<input id="correoUsuario" required /></label>
              <label>Contraseña<input id="passUsuario" required /></label>
              <button class="primary-btn" type="submit">Crear usuario</button>
            </form>
          </section>
          <section id="planificacion" class="view-card">
            <h3>Planificación</h3>
            <p>Administra horarios, consultorios y auditoría desde aquí.</p>
            <button id="abrirPlanificacion" class="primary-btn">Abrir módulo</button>
          </section>
        </main>
      </div>
    `;

    document.getElementById('formPerfil').addEventListener('submit', (e) => this.guardarPerfil(e));
    document.getElementById('formUsuario').addEventListener('submit', (e) => this.guardarUsuario(e));
    document.getElementById('abrirPlanificacion').addEventListener('click', () => this.mostrarPlanificacion());
    document.querySelectorAll('.menu-btn').forEach((btn) => btn.addEventListener('click', () => this.cambiarVista(btn.dataset.view)));
    document.getElementById('btnCerrarSesion').addEventListener('click', () => this.cerrarSesion());
    this.cargarTablaPerfiles();
  }

  cerrarSesion() {
    this.gestor.notificar({ tipo: 'LOGOUT', datos: {} });
    import('./VistaLogin.js').then(({ VistaLogin }) => new VistaLogin(this.gestor));
  }

  cambiarVista(vista) {
    document.querySelectorAll('.view-card').forEach((card) => card.classList.toggle('active', card.id === vista));
    document.querySelectorAll('.menu-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.view === vista));
  }

  async cargarTablaPerfiles() {
    const tbody = document.getElementById('tablaPerfiles');
    tbody.innerHTML = '';
    const perfiles = await this.svcPerfiles.obtenerPerfiles();
    perfiles.forEach((p) => {
      const fila = document.createElement('tr');
      fila.innerHTML = `<td>${p.nombre}</td><td>${p.estado}</td>`;
      tbody.appendChild(fila);
    });
  }

  async guardarPerfil(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombrePerfil').value;
    const descripcion = document.getElementById('descripcionPerfil').value;
    const estado = document.getElementById('estadoPerfil').value;
    const res = await this.svcPerfiles.registrarPerfil(nombre, descripcion, ['GESTION_CITAS']);
    alert(res.mensaje);
    if (res.exito) {
      this.cargarTablaPerfiles();
    }
  }

  async guardarUsuario(e) {
    e.preventDefault();
    const correo = document.getElementById('correoUsuario').value;
    const pass = document.getElementById('passUsuario').value;
    const res = await this.svcUsuarios.registrarUsuario(correo, pass, 1);
    alert(res.mensaje);
  }

  mostrarPlanificacion() {
    import('./VistaPlanificacion.js').then(({ VistaPlanificacion }) => {
      new VistaPlanificacion(this.gestor, null);
    });
  }
}
