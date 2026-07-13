import { ServicioPerfiles } from '../negocio/ServicioPerfiles.js';
import { ServicioUsuarios } from '../negocio/ServicioUsuarios.js';
import { VistaPlanificacion } from './VistaPlanificacion.js';

const PERMISOS_MINIMOS = [
  { value: 'ALL', label: 'Acceso Total (Administrador)' },
  { value: 'GESTION_PERFILES', label: 'Perfiles y roles' },
  { value: 'GESTION_USUARIOS', label: 'Usuarios' },
  { value: 'GESTION_PLANIFICACION', label: 'Planificación' },
  { value: 'PACIENTES', label: 'Pacientes' },
  { value: 'CITAS', label: 'Citas' },
  { value: 'CITAS_PROPIAS', label: 'Citas Propias (Fisioterapeuta)' }
];

export class VistaPerfiles {
  constructor(gestor) {
    this.gestor = gestor;
    this.usuarioActual = window.appState?.currentUser || null;
    this.perfilActual = window.appState?.currentProfile || null;
    this.svcPerfiles = new ServicioPerfiles(gestor, this.usuarioActual, this.perfilActual, window.appState?.perfilRepo);
    this.svcUsuarios = new ServicioUsuarios(gestor, this.usuarioActual, window.appState?.usuarioRepo);
    this.perfiles = [];
    this.perfilEditandoId = null;
    this.filtros = { texto: '', estado: 'Todos' };
    this.render();
  }

  render() {
    const container = document.getElementById('app');
    container.innerHTML = `
      <div class="dashboard-shell">
        <aside class="sidebar">
          <h2>FiCitas</h2>
          <p>Panel de administrador</p>
          <button class="menu-btn active" data-view="roles">Roles y Permisos</button>
          <button class="menu-btn" data-view="usuarios">Perfiles de Empleados</button>
          <hr style="margin: 10px 0; border: none; border-top: 1px solid var(--border);" />
          <h4 style="margin: 0; color: var(--muted); font-size: 0.75rem; padding-left: 10px; letter-spacing: 0.05em; text-transform: uppercase;">PLANIFICACIÓN</h4>
          <button class="menu-btn" data-view="horarios">Horarios</button>
          <button class="menu-btn" data-view="consultorios">Consultorios</button>
          <button class="menu-btn" data-view="auditoria">Auditoría</button>
          <button id="btnCerrarSesion" class="logout-btn" style="margin-top: auto;">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 17l1.41-1.41L8.83 13H20v-2H8.83l2.58-2.59L10 7l-5 5 5 5zm10-14H12v2h8v14h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
             </svg> Cerrar sesión
          </button>
        </aside>
        <main class="main-panel">
          <section id="roles" class="view-card active">
            <h3>Roles y Permisos</h3>
            <form id="formPerfil" class="form-grid">
              <div style="grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                 <label>Nombre<input id="nombrePerfil" required /></label>
                 <label>Estado<select id="estadoPerfil"><option>Activo</option><option>Inactivo</option></select></label>
              </div>
              <label style="grid-column: 1 / -1;">Descripción<textarea id="descripcionPerfil" rows="2" required></textarea></label>
              <div class="checkbox-group" id="grupoPermisosPerfil">
                ${PERMISOS_MINIMOS.map((permiso) => `<label><input type="checkbox" name="permisoPerfil" value="${permiso.value}" /> ${permiso.label}</label>`).join('')}
              </div>
              <input id="idPerfil" type="hidden" />
              <button class="primary-btn" type="submit" style="width: max-content;">Guardar Rol</button>
            </form>
            <div class="form-grid" style="margin-top: 18px;">
              <label>Buscar por nombre<input id="filtroNombrePerfil" placeholder="Escribe para filtrar" /></label>
              <label>Filtrar por estado<select id="filtroEstadoPerfil"><option value="Todos">Todos</option><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option></select></label>
            </div>
            <table>
              <thead><tr><th>Nombre</th><th>Descripción</th><th>Estado</th><th>Permisos</th><th>Acciones</th></tr></thead>
              <tbody id="tablaPerfiles"></tbody>
            </table>
          </section>
          <section id="usuarios" class="view-card">
            <h3>Perfiles de Empleados</h3>
            <form id="formUsuario" class="form-grid">
              <label>Nombre de Usuario<input id="usernameUsuario" required /></label>
              <label>Correo<input id="correoUsuario" required /></label>
              <label>Contraseña<input id="passUsuario" required /></label>
              <label>Perfil<select id="perfilUsuario"></select></label>
              <button class="primary-btn" type="submit" style="width: max-content;">Crear Empleado</button>
            </form>
          </section>
          
          <div id="planificacion-container"></div>
        </main>
      </div>
    `;

    document.getElementById('formPerfil').addEventListener('submit', (e) => this.guardarPerfil(e));
    document.getElementById('formUsuario').addEventListener('submit', (e) => this.guardarUsuario(e));
    document.getElementById('filtroNombrePerfil').addEventListener('input', (e) => this.aplicarFiltroNombre(e.target.value));
    document.getElementById('filtroEstadoPerfil').addEventListener('change', (e) => this.aplicarFiltroEstado(e.target.value));
    document.querySelectorAll('.menu-btn').forEach((btn) => btn.addEventListener('click', () => this.cambiarVista(btn.dataset.view)));
    document.getElementById('btnCerrarSesion').addEventListener('click', () => this.cerrarSesion());
    this.cargarPerfiles();
    
    // Inyectar VistaPlanificacion
    new VistaPlanificacion(this.gestor, this.usuarioActual).render('planificacion-container', false);
  }

  cerrarSesion() {
    this.gestor.notificar({ tipo: 'LOGOUT', datos: {} });
    if (window.appState) {
      window.appState.currentUser = null;
      window.appState.currentProfile = null;
      window.appState.permisosActuales = [];
    }
    import('./VistaLogin.js').then(({ VistaLogin }) => new VistaLogin(this.gestor));
  }

  cambiarVista(vista) {
    document.querySelectorAll('.view-card').forEach((card) => card.classList.toggle('active', card.id === vista));
    document.querySelectorAll('.menu-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.view === vista));
  }

  async cargarPerfiles() {
    this.perfiles = await this.svcPerfiles.obtenerPerfiles() || [];
    this.cargarTablaPerfiles();
    this.cargarSelectUsuarios();
  }

  cargarSelectUsuarios() {
    const select = document.getElementById('perfilUsuario');
    if (!select) return;

    const perfilesActivos = this.perfiles.filter((perfil) => !perfil.estado || perfil.estado === 'Activo');
    select.innerHTML = perfilesActivos.length
      ? perfilesActivos.map((perfil) => `<option value="${perfil.id || perfil._id}">${perfil.nombre}</option>`).join('')
      : '<option value="">Sin perfiles activos</option>';
  }

  cargarTablaPerfiles() {
    const tbody = document.getElementById('tablaPerfiles');
    if (!tbody) return;
    tbody.innerHTML = '';
    const perfilesFiltrados = this.perfiles.filter((perfil) => this.coincideFiltro(perfil));

    if (perfilesFiltrados.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">No hay roles para mostrar</td></tr>';
      return;
    }

    perfilesFiltrados.forEach((p) => {
      const fila = document.createElement('tr');
      const permisos = Array.isArray(p.permisos) ? p.permisos.join(', ') : '';
      const pid = p.id || p._id;
      const esAdmin = p.nombre.toLowerCase() === 'administrador';
      
      fila.innerHTML = `
        <td>${p.nombre}</td>
        <td>${p.descripcion || ''}</td>
        <td>${p.estado}</td>
        <td><small>${permisos}</small></td>
        <td>
          <button type="button" class="inline-btn" data-id="${pid}" data-action="editar">
             ✎ Editar
          </button>
          ${!esAdmin ? `
            <button type="button" class="inline-btn ${p.estado === 'Activo' ? 'danger' : 'success'}" data-id="${pid}" data-action="estado">
               ${p.estado === 'Activo' ? '🚫 Inactivar' : '✅ Activar'}
            </button>
          ` : ''}
        </td>
      `;
      fila.querySelector('[data-action="editar"]').addEventListener('click', () => this.cargarPerfilEnFormulario(p));
      
      const btnEstado = fila.querySelector('[data-action="estado"]');
      if (btnEstado) {
        btnEstado.addEventListener('click', () => this.cambiarEstadoPerfil(pid, p.estado === 'Activo' ? 'Inactivo' : 'Activo'));
      }
      
      tbody.appendChild(fila);
    });
  }

  async cambiarEstadoPerfil(id, nuevoEstado) {
    const res = await this.svcPerfiles.modificarPerfil(id, { estado: nuevoEstado });
    if (res.exito) {
      await this.cargarPerfiles();
    } else {
      alert(res.mensaje);
    }
  }

  coincideFiltro(perfil) {
    const texto = this.filtros.texto.toLowerCase();
    const estado = this.filtros.estado;
    const coincideNombre = !texto || (perfil.nombre || '').toLowerCase().includes(texto);
    const coincideEstado = estado === 'Todos' || perfil.estado === estado;
    return coincideNombre && coincideEstado;
  }

  aplicarFiltroNombre(valor) {
    this.filtros.texto = valor || '';
    this.cargarTablaPerfiles();
  }

  aplicarFiltroEstado(valor) {
    this.filtros.estado = valor || 'Todos';
    this.cargarTablaPerfiles();
  }

  cargarPerfilEnFormulario(perfil) {
    this.perfilEditandoId = perfil.id;
    document.getElementById('idPerfil').value = perfil.id;
    document.getElementById('nombrePerfil').value = perfil.nombre || '';
    document.getElementById('descripcionPerfil').value = perfil.descripcion || '';
    document.getElementById('estadoPerfil').value = perfil.estado || 'Activo';
    document.querySelectorAll('input[name="permisoPerfil"]').forEach((checkbox) => {
      checkbox.checked = Array.isArray(perfil.permisos) && perfil.permisos.includes(checkbox.value);
    });
    const boton = document.querySelector('#formPerfil .primary-btn');
    if (boton) boton.textContent = 'Actualizar';
  }

  limpiarFormularioPerfil() {
    this.perfilEditandoId = null;
    document.getElementById('formPerfil').reset();
    document.getElementById('idPerfil').value = '';
    const boton = document.querySelector('#formPerfil .primary-btn');
    if (boton) boton.textContent = 'Guardar';
  }

  obtenerPermisosSeleccionados() {
    return Array.from(document.querySelectorAll('input[name="permisoPerfil"]:checked')).map((checkbox) => checkbox.value);
  }

  async guardarPerfil(e) {
    e.preventDefault();
    const payload = {
      nombre: document.getElementById('nombrePerfil').value,
      descripcion: document.getElementById('descripcionPerfil').value,
      estado: document.getElementById('estadoPerfil').value,
      permisos: this.obtenerPermisosSeleccionados(),
    };

    const res = this.perfilEditandoId
      ? await this.svcPerfiles.modificarPerfil(this.perfilEditandoId, payload)
      : await this.svcPerfiles.registrarPerfil(payload);

    alert(res.mensaje);
    if (res.exito) {
      this.limpiarFormularioPerfil();
      await this.cargarPerfiles();
    }
  }

  async guardarUsuario(e) {
    e.preventDefault();
    const username = document.getElementById('usernameUsuario').value;
    const correo = document.getElementById('correoUsuario').value;
    const pass = document.getElementById('passUsuario').value;
    const perfilId = document.getElementById('perfilUsuario').value;
    const res = await this.svcUsuarios.registrarUsuario(username, correo, pass, perfilId);
    alert(res.mensaje);
    if (res.exito) {
      document.getElementById('formUsuario').reset();
    }
  }

  mostrarPlanificacion() {
    import('./VistaPlanificacion.js').then(({ VistaPlanificacion }) => {
      new VistaPlanificacion(this.gestor, null);
    });
  }
}
