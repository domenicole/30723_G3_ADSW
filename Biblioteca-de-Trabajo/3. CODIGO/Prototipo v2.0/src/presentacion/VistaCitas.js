import { DisponibilidadDecorador } from '../negocio/DisponibilidadDecorador.js';
import { ServicioCitas } from '../negocio/ServicioCitas.js';

export class VistaCitas {
  constructor(gestor) {
    this.gestor = gestor;
    this.svcCitasDecorado = new DisponibilidadDecorador(
      new ServicioCitas(gestor, 1, window.appState?.citaRepo), 
      window.appState?.pacienteRepo
    );
    this.citas = [];
    this.citaEditandoId = null;
    this.filtros = { fecha: '', cedula: '', estado: 'Todos' };
  }

  render(containerId = 'citasContainer') {
    const appState = window.appState || {};
    const esFisio = (appState.currentProfile?.nombre || '').trim().toLowerCase() === 'fisioterapeuta';
    const emailUsuario = appState.currentUser?.correo || '';

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="panel">
        <h2>Gestión de Citas</h2>
        
        <div id="panelConfirmacion" class="panel-aviso" style="display: none; background-color: #d4edda; color: #155724; padding: 10px; margin-bottom: 15px; border-radius: 4px;">
        </div>

        ${!esFisio ? `
        <form id="formCita" class="form-grid">
          <input id="idCita" type="hidden" />
          <label>Cédula Paciente<input id="pacienteId" required maxlength="10" placeholder="Ej: 1712345678" /></label>
          <label>Servicio<input id="servicio" required /></label>
          <label>Consultorio
            <select id="consultorio" required>
              <option value="Consultorio 1">Consultorio 1</option>
              <option value="Consultorio 2">Consultorio 2</option>
              <option value="Consultorio 3">Consultorio 3</option>
            </select>
          </label>
          <label>Fisioterapeuta (Correo)<input id="fisioCita" placeholder="fisioterapeuta@ficitas.com" required /></label>
          <label>Fecha<input id="fechaCita" type="date" required /></label>
          <label>Hora<input id="horaCita" type="time" required /></label>
          <label>Duración (minutos)<input id="duracion" type="number" min="1" max="120" required value="30" /></label>
          <button class="primary-btn" type="submit" id="btnGuardarCita">Agendar</button>
          <button class="secondary-btn" type="button" id="btnCancelarEdicionCita" style="display: none;">Cancelar</button>
        </form>
        ` : ''}
        
        <div class="form-grid" style="margin-top: 18px; padding-top: 18px; border-top: 1px solid #ddd;">
          <label>Filtrar Fecha<input id="filtroFechaCita" type="date" /></label>
          <label>Filtrar Cédula<input id="filtroCedulaCita" placeholder="Cédula" /></label>
          <label>Filtrar Estado
            <select id="filtroEstadoCita">
              <option value="Todos">Todos</option>
              <option value="Programada">Programada</option>
              <option value="Reprogramada">Reprogramada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </label>
        </div>

        <table>
          <thead><tr><th>Cédula Paciente</th><th>Servicio / Fisio</th><th>Consultorio</th><th>Fecha</th><th>Hora</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody id="tablaCitas"></tbody>
        </table>
        
        <div id="modalCancelacion" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000;">
          <div style="background: white; padding: 20px; border-radius: 8px; width: 300px; text-align: center;">
            <h3>Motivo de cancelación</h3>
            <input type="hidden" id="cancelacionCitaId" />
            <input id="motivoCancelacion" type="text" style="width: 100%; padding: 8px; margin-bottom: 10px;" placeholder="Ej. El paciente no asistirá" />
            <div style="display: flex; gap: 10px; justify-content: center;">
              <button id="btnConfirmarCancelacion" class="primary-btn">Confirmar</button>
              <button id="btnCerrarModalCancelacion" class="secondary-btn">Volver</button>
            </div>
          </div>
        </div>
      </div>
    `;

    if (!esFisio) {
      document.getElementById('formCita').addEventListener('submit', (e) => this.guardar(e));
      document.getElementById('btnCancelarEdicionCita').addEventListener('click', () => this.limpiarFormulario());
    }
    
    document.getElementById('filtroFechaCita').addEventListener('input', (e) => this.aplicarFiltro('fecha', e.target.value));
    document.getElementById('filtroCedulaCita').addEventListener('input', (e) => this.aplicarFiltro('cedula', e.target.value));
    document.getElementById('filtroEstadoCita').addEventListener('change', (e) => this.aplicarFiltro('estado', e.target.value));
    
    document.getElementById('btnConfirmarCancelacion').addEventListener('click', () => this.procesarCancelacion());
    document.getElementById('btnCerrarModalCancelacion').addEventListener('click', () => {
      document.getElementById('modalCancelacion').style.display = 'none';
    });

    this.cargarDatos();
  }

  async cargarDatos() {
    this.citas = await this.svcCitasDecorado.obtenerTodas() || [];
    this.cargarTabla();
  }

  cargarTabla() {
    const tbody = document.getElementById('tablaCitas');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const appState = window.appState || {};
    const esFisio = (appState.currentProfile?.nombre || '').trim().toLowerCase() === 'fisioterapeuta';
    const emailUsuario = appState.currentUser?.correo || '';

    let citasFiltradas = this.citas.filter((c) => this.coincideFiltro(c));
    
    if (esFisio) {
      citasFiltradas = citasFiltradas.filter((c) => c.fisioterapeuta === emailUsuario);
    }
    
    if (citasFiltradas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">No hay citas para mostrar</td></tr>';
      return;
    }
    
    citasFiltradas.forEach((c) => {
      const fila = document.createElement('tr');
      let acciones = '';
      if (c.estado !== 'Cancelada' && !esFisio) {
        acciones = `
          <button type="button" data-id="${c.id}" class="inline-btn btn-reprogramar">✎ Editar</button>
          <button type="button" data-id="${c.id}" class="inline-btn danger btn-cancelar">🚫 Cancelar</button>
        `;
      } else if (c.estado !== 'Cancelada' && esFisio) {
        acciones = `
          <button type="button" data-id="${c.id}" class="inline-btn danger btn-cancelar">🚫 Cancelar</button>
        `;
      }
      fila.innerHTML = `<td>${c.pacienteId}</td><td>${c.servicio}<br/><small>${c.fisioterapeuta || 'No asignado'}</small></td><td>${c.consultorio}</td><td>${c.fecha}</td><td>${c.hora}</td><td>${c.estado}</td><td>${acciones}</td>`;
      tbody.appendChild(fila);
    });
    this.agregarHandlersTabla();
  }
  
  coincideFiltro(cita) {
    const fecha = this.filtros.fecha;
    const cedula = this.filtros.cedula;
    const estado = this.filtros.estado;
    
    const coincideFecha = !fecha || cita.fecha === fecha;
    const coincideCedula = !cedula || (cita.pacienteId || '').includes(cedula);
    const coincideEstado = estado === 'Todos' || cita.estado === estado;
    
    return coincideFecha && coincideCedula && coincideEstado;
  }
  
  aplicarFiltro(tipo, valor) {
    this.filtros[tipo] = valor || (tipo === 'estado' ? 'Todos' : '');
    this.cargarTabla();
  }

  agregarHandlersTabla() {
    document.querySelectorAll('.btn-cancelar').forEach((btn) => {
      btn.addEventListener('click', () => this.abrirModalCancelacion(btn.dataset.id));
    });
    document.querySelectorAll('.btn-reprogramar').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cita = this.citas.find(c => c.id === Number(btn.dataset.id));
        if (cita) this.cargarCitaEnFormulario(cita);
      });
    });
  }
  
  abrirModalCancelacion(id) {
    document.getElementById('cancelacionCitaId').value = id;
    document.getElementById('motivoCancelacion').value = '';
    document.getElementById('modalCancelacion').style.display = 'flex';
  }

  async procesarCancelacion() {
    const id = document.getElementById('cancelacionCitaId').value;
    const motivo = document.getElementById('motivoCancelacion').value;
    if (!motivo.trim()) {
      alert('Debe ingresar un motivo');
      return;
    }
    
    const res = await this.svcCitasDecorado.cancelarCita(id, motivo);
    alert(res.mensaje);
    if (res.exito) {
      document.getElementById('modalCancelacion').style.display = 'none';
      this.cargarDatos();
    }
  }

  cargarCitaEnFormulario(cita) {
    this.citaEditandoId = cita.id;
    document.getElementById('idCita').value = cita.id;
    document.getElementById('pacienteId').value = cita.pacienteId;
    document.getElementById('pacienteId').disabled = true;
    document.getElementById('servicio').value = cita.servicio;
    document.getElementById('consultorio').value = cita.consultorio;
    const fisioInput = document.getElementById('fisioCita');
    if (fisioInput) fisioInput.value = cita.fisioterapeuta || '';
    document.getElementById('fechaCita').value = cita.fecha;
    document.getElementById('horaCita').value = cita.hora;
    document.getElementById('duracion').value = cita.duracion;
    document.getElementById('duracion').disabled = true;
    
    document.getElementById('btnGuardarCita').textContent = 'Guardar Cambios';
    document.getElementById('btnCancelarEdicionCita').style.display = 'inline-block';
    
    document.getElementById('panelConfirmacion').style.display = 'none';
  }
  
  limpiarFormulario() {
    this.citaEditandoId = null;
    document.getElementById('formCita').reset();
    document.getElementById('idCita').value = '';
    
    document.getElementById('pacienteId').disabled = false;
    document.getElementById('duracion').disabled = false;
    
    document.getElementById('btnGuardarCita').textContent = 'Agendar';
    document.getElementById('btnCancelarEdicionCita').style.display = 'none';
  }

  async guardar(e) {
    e.preventDefault();
    const pacId = document.getElementById('pacienteId').value;
    const serv = document.getElementById('servicio').value;
    const cons = document.getElementById('consultorio').value;
    const fisioInput = document.getElementById('fisioCita');
    const fisio = fisioInput ? fisioInput.value : '';
    const fecha = document.getElementById('fechaCita').value;
    const hora = document.getElementById('horaCita').value;
    const dur = document.getElementById('duracion').value;
    
    document.getElementById('panelConfirmacion').style.display = 'none';

    let res;
    if (this.citaEditandoId) {
      res = await this.svcCitasDecorado.reprogramarCita(this.citaEditandoId, fecha, hora, serv, cons, fisio);
    } else {
      res = await this.svcCitasDecorado.registrarCita(pacId, serv, cons, fecha, hora, dur, fisio);
    }
    
    if (res.exito) {
      const panel = document.getElementById('panelConfirmacion');
      const modo = this.citaEditandoId ? "modificada" : "agendada";
      panel.innerHTML = `<strong>¡Cita ${modo} con éxito!</strong><br/>
        Código: ${res.cita.id}<br/>
        Paciente: ${res.cita.pacienteId}<br/>
        Consultorio: ${res.cita.consultorio}<br/>
        Fisioterapeuta: ${res.cita.fisioterapeuta || 'N/A'}<br/>
        Fecha y hora: ${res.cita.fecha} ${res.cita.hora}`;
      panel.style.display = 'block';
      
      this.limpiarFormulario();
      this.cargarDatos();
    } else {
      alert(res.mensaje);
    }
  }
}
