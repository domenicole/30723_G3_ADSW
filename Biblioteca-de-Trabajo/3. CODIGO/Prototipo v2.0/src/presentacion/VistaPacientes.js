import { ValidacionDecorador } from '../negocio/ValidacionDecorador.js';
import { ServicioPacientes } from '../negocio/ServicioPacientes.js';
import { VistaCitas } from './VistaCitas.js';

export class VistaPacientes {
  constructor(gestor) {
    this.gestor = gestor;
    const pacienteRepo = window.appState?.pacienteRepo;
    this.svcDecorado = new ValidacionDecorador(new ServicioPacientes(pacienteRepo));
    this.pacientes = [];
    this.pacienteEditandoId = null;
    this.filtros = { nombre: '', cedula: '' };
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
              <label>Sexo<select id="sexo" required><option value="">Seleccione</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option><option value="Otro">Otro</option></select></label>
              <label>Teléfono<input id="telefono" maxlength="10" required /></label>
              <label>Correo<input id="correo" type="email" required /></label>
              <label>Canal preferido<select id="canalPreferido"><option value="WhatsApp">WhatsApp</option><option value="Correo">Correo</option></select></label>
              <label>Fecha Nac.<input id="fecha" type="date" required /></label>
              <label>Domicilio<input id="domicilio" required /></label>
              <label>Ocupación<input id="ocupacion" required /></label>
              <label>Estado Civil<select id="estadoCivil"><option>Soltero</option><option>Casado</option><option>Divorciado</option><option>Viudo</option><option>Unión Libre</option></select></label>
              <button class="primary-btn" type="submit" id="btnGuardarPaciente">Guardar</button>
              <button class="secondary-btn" type="button" id="btnCancelarEdicion" style="display: none;">Cancelar</button>
            </form>
            <div id="panelAvisos" class="panel-aviso"></div>
            
            <div class="form-grid" style="margin-top: 18px;">
              <label>Buscar por Nombre<input id="filtroNombrePaciente" placeholder="Filtrar por nombre" /></label>
              <label>Buscar por Cédula<input id="filtroCedulaPaciente" placeholder="Filtrar por cédula" maxlength="10" /></label>
            </div>
            
            <table>
              <thead><tr><th>Cédula</th><th>Nombre</th><th>Sexo</th><th>Teléfono</th><th>Correo</th><th>Canal</th><th>Estado</th><th>Acciones</th></tr></thead>
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
    document.getElementById('btnCancelarEdicion').addEventListener('click', () => this.limpiarFormulario());
    document.getElementById('filtroNombrePaciente').addEventListener('input', (e) => this.aplicarFiltroNombre(e.target.value));
    document.getElementById('filtroCedulaPaciente').addEventListener('input', (e) => this.aplicarFiltroCedula(e.target.value));
    
    document.querySelectorAll('.menu-btn').forEach((btn) => btn.addEventListener('click', () => this.cambiarVista(btn.dataset.view)));
    document.getElementById('btnCerrarSesion').addEventListener('click', () => this.cerrarSesion());
    this.cargarDatos();
    new VistaCitas(this.gestor).render();
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

  async cargarDatos() {
    this.pacientes = await this.svcDecorado.obtenerPacientes() || [];
    this.cargarTabla();
  }

  cargarTabla() {
    const tbody = document.getElementById('tablaPacientes');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const pacientesFiltrados = this.pacientes.filter((p) => this.coincideFiltro(p));
    
    if (pacientesFiltrados.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8">No hay pacientes para mostrar</td></tr>';
      return;
    }
    
    pacientesFiltrados.forEach((p) => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${p.cedula}</td>
        <td>${p.nombre}</td>
        <td>${p.sexo || ''}</td>
        <td>${p.telefono}</td>
        <td>${p.correo || ''}</td>
        <td>${p.canalPreferido || ''}</td>
        <td>${p.estado}</td>
        <td>
          <button type="button" class="inline-btn" data-id="${p.id}" data-action="editar">✎ Editar</button>
          <button type="button" class="inline-btn ${p.estado === 'Activo' ? 'danger' : 'success'}" data-id="${p.id}" data-action="estado">
            ${p.estado === 'Activo' ? '🚫 Inactivar' : '✅ Activar'}
          </button>
        </td>
      `;
      fila.querySelector('[data-action="editar"]').addEventListener('click', () => this.cargarPacienteEnFormulario(p));
      fila.querySelector('[data-action="estado"]').addEventListener('click', () => this.cambiarEstado(p.id, p.estado === 'Activo' ? 'Inactivo' : 'Activo'));
      tbody.appendChild(fila);
    });
  }
  
  coincideFiltro(paciente) {
    const nombre = this.filtros.nombre.toLowerCase();
    const cedula = this.filtros.cedula;
    const coincideNombre = !nombre || (paciente.nombre || '').toLowerCase().includes(nombre);
    const coincideCedula = !cedula || (paciente.cedula || '').includes(cedula);
    return coincideNombre && coincideCedula;
  }
  
  aplicarFiltroNombre(valor) {
    this.filtros.nombre = valor || '';
    this.cargarTabla();
  }
  
  aplicarFiltroCedula(valor) {
    this.filtros.cedula = valor || '';
    this.cargarTabla();
  }
  
  cargarPacienteEnFormulario(paciente) {
    this.pacienteEditandoId = paciente.id;
    document.getElementById('idPaciente').value = paciente.id;
    document.getElementById('cedula').value = paciente.cedula;
    document.getElementById('cedula').disabled = true;
    document.getElementById('nombre').value = paciente.nombre;
    document.getElementById('nombre').disabled = true;
    document.getElementById('sexo').value = paciente.sexo || '';
    document.getElementById('sexo').disabled = true;
    document.getElementById('fecha').value = paciente.fechaNacimiento || paciente.fecha || '';
    document.getElementById('fecha').disabled = true;
    
    document.getElementById('telefono').value = paciente.telefono;
    document.getElementById('correo').value = paciente.correo;
    document.getElementById('canalPreferido').value = paciente.canalPreferido;
    document.getElementById('domicilio').value = paciente.domicilio;
    document.getElementById('ocupacion').value = paciente.ocupacion;
    document.getElementById('estadoCivil').value = paciente.estadoCivil;
    
    document.getElementById('btnGuardarPaciente').textContent = 'Actualizar';
    document.getElementById('btnCancelarEdicion').style.display = 'inline-block';
  }
  
  limpiarFormulario() {
    this.pacienteEditandoId = null;
    document.getElementById('formPaciente').reset();
    document.getElementById('idPaciente').value = '';
    
    document.getElementById('cedula').disabled = false;
    document.getElementById('nombre').disabled = false;
    document.getElementById('sexo').disabled = false;
    document.getElementById('fecha').disabled = false;
    
    document.getElementById('btnGuardarPaciente').textContent = 'Guardar';
    document.getElementById('btnCancelarEdicion').style.display = 'none';
  }

  async cambiarEstado(id, nuevoEstado) {
    const res = await this.svcDecorado.cambiarEstado(id, nuevoEstado);
    if (res.exito) {
      await this.cargarDatos();
    } else {
      alert(res.mensaje);
    }
  }

  async guardar(e) {
    e.preventDefault();
    const telefono = document.getElementById('telefono').value;
    const correo = document.getElementById('correo').value;
    const canalPreferido = document.getElementById('canalPreferido').value;
    const domicilio = document.getElementById('domicilio').value;
    const ocupacion = document.getElementById('ocupacion').value;
    const estadoCivil = document.getElementById('estadoCivil').value;
    
    let res;
    if (this.pacienteEditandoId) {
      res = await this.svcDecorado.modificarPaciente(this.pacienteEditandoId, domicilio, telefono, correo, canalPreferido, ocupacion, estadoCivil);
    } else {
      const cedula = document.getElementById('cedula').value;
      const nombre = document.getElementById('nombre').value;
      const sexo = document.getElementById('sexo').value;
      const fecha = document.getElementById('fecha').value;
      res = await this.svcDecorado.registrarPaciente(cedula, nombre, sexo, telefono, correo, canalPreferido, fecha, domicilio, ocupacion, estadoCivil);
    }
    
    alert(res.mensaje);
    if (res.exito) {
      this.limpiarFormulario();
      await this.cargarDatos();
    }
  }
}
