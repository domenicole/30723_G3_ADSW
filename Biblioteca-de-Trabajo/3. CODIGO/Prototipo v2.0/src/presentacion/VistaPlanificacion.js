import { ServicioPlanificacion } from '../negocio/ServicioPlanificacion.js';

import { VistaCitas } from './VistaCitas.js';

export class VistaPlanificacion {
  constructor(gestor, usuario) {
    this.gestor = gestor;
    this.usuario = usuario;
    this.servicio = new ServicioPlanificacion(gestor, usuario);
    this.auditoriaRepo = window.appState?.auditoriaRepo || null;
    this.horarioEditandoId = null;
  }

  render(containerId = 'app', renderSidebar = true) {
    const app = document.getElementById(containerId);
    if (!app) return;
    
    const perfilNombre = (window.appState?.currentProfile?.nombre || '').trim().toLowerCase();
    const esFisio = perfilNombre === 'fisioterapeuta';
    
    const contentHTML = `
      <section id="horarios" class="view-card ${renderSidebar ? 'active' : ''}">
        <h3>Registrar horario</h3>
        <form id="formHorario" class="form-grid">
          <label>Fecha<input id="fechaHorario" type="date" required /></label>
          <label>Hora inicio<input id="horaInicio" type="time" required /></label>
          <label>Hora fin<input id="horaFin" type="time" required /></label>
          <label>Cupo mínimo<input id="cupoHorario" type="number" min="1" value="1" required /></label>
          <label>Estado<select id="estadoHorario"><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option></select></label>
          <label>Fisioterapeuta<input id="fisioterapeuta" /></label>
          <label>Consultorio<select id="consultorioHorario"></select></label>
          <button class="primary-btn" type="submit" id="btnGuardarHorario">Guardar horario</button>
          <button class="secondary-btn" type="button" id="btnCancelarEdicionHorario" style="display: none;">Cancelar</button>
        </form>
        
        <div style="margin-top: 20px; display: flex; gap: 15px; align-items: center;">
          <h3 style="margin: 0;">Horarios del día</h3>
          <input id="filtroFechaListado" type="date" />
          <select id="filtroEstadoListado">
            <option value="Todos">Todos</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>
        </div>
        <div id="listaHorarios" style="margin-top: 15px;"></div>
      </section>

      ${!esFisio ? `
      <section id="consultorios" class="view-card">
        <h3>Registrar consultorio</h3>
        <form id="formConsultorio" class="form-grid">
          <label>Nombre<input id="nombreConsultorio" required /></label>
          <label>Capacidad<input id="capacidadConsultorio" type="number" min="1" required /></label>
          <button class="primary-btn" type="submit">Guardar consultorio</button>
        </form>
        <div id="listaConsultorios" style="margin-top: 15px;"></div>
      </section>

      <section id="auditoria" class="view-card">
        <h3>Auditoría</h3>
        <div id="listaAuditoria"></div>
      </section>
      ` : `
      <section id="citas" class="view-card">
        <div id="citasContainerPlanif"></div>
      </section>
      `}
    `;
    
    if (renderSidebar) {
      app.innerHTML = `
        <div class="dashboard-shell">
          <aside class="sidebar">
            <h2>FiCitas</h2>
            <p>Panel de Fisioterapeuta</p>
            <button class="menu-btn active" data-view="horarios">Horarios</button>
            <button class="menu-btn" data-view="citas">Mis Citas</button>
            <button id="btnCerrarSesionPlanif" class="logout-btn" style="margin-top: auto;">   
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 17l1.41-1.41L8.83 13H20v-2H8.83l2.58-2.59L10 7l-5 5 5 5zm10-14H12v2h8v14h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
              </svg> Cerrar sesión
            </button>
          </aside>
          <main class="main-panel">
            ${contentHTML}
          </main>
        </div>
      `;
    } else {
      app.innerHTML = contentHTML;
    }

    document.getElementById('filtroFechaListado').value = new Date().toISOString().split('T')[0];

    this.cargarConsultorios();
    this.cargarHorarios();
    if (!esFisio) {
      this.cargarAuditoria();
      const formCons = document.getElementById('formConsultorio');
      if (formCons) formCons.addEventListener('submit', (e) => this.guardarConsultorio(e));
    } else {
      // Inyectar VistaCitas para el Fisioterapeuta
      if (document.getElementById('citasContainerPlanif')) {
         const vistaCitas = new VistaCitas(this.gestor);
         // Forzaremos el filtro de fisioterapeuta a su nombre/correo
         vistaCitas.render('citasContainerPlanif');
         setTimeout(() => {
           const inputFiltro = document.getElementById('filtroFisioCita');
           if (inputFiltro && this.usuario) {
             inputFiltro.value = this.usuario.correo || '';
             // trigger update somehow or let the user type?
             // Best to just set it. We'll leave it simple.
           }
         }, 100);
      }
    }
    
    document.getElementById('formHorario').addEventListener('submit', (e) => this.guardarHorario(e));
    document.getElementById('btnCancelarEdicionHorario').addEventListener('click', () => this.limpiarFormularioHorario());
    
    document.getElementById('filtroFechaListado').addEventListener('change', () => this.cargarHorarios());
    document.getElementById('filtroEstadoListado').addEventListener('change', () => this.cargarHorarios());
    
    if (renderSidebar) {
      document.querySelectorAll('.menu-btn').forEach((btn) => btn.addEventListener('click', () => this.cambiarVista(btn.dataset.view)));
      const btnCerrar = document.getElementById('btnCerrarSesionPlanif');
      if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
          this.gestor.notificar({ tipo: 'LOGOUT', datos: {} });
          if (window.appState) {
            window.appState.currentUser = null;
            window.appState.currentProfile = null;
            window.appState.permisosActuales = [];
          }
          import('./VistaLogin.js').then(({ VistaLogin }) => new VistaLogin(this.gestor));
        });
      }
    }
  }

  cambiarVista(vista) {
    document.querySelectorAll('.view-card').forEach((card) => card.classList.toggle('active', card.id === vista));
    document.querySelectorAll('.menu-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.view === vista));
  }

  guardarHorario(e) {
    e.preventDefault();
    const cupo = document.getElementById('cupoHorario').value;
    const estado = document.getElementById('estadoHorario').value;
    
    let res;
    if (this.horarioEditandoId) {
      res = this.servicio.modificarHorario(this.horarioEditandoId, { cupo, estado });
    } else {
      const payload = {
        fecha: document.getElementById('fechaHorario').value,
        horaInicio: document.getElementById('horaInicio').value,
        horaFin: document.getElementById('horaFin').value,
        cupo,
        estado,
        consultorioId: Number(document.getElementById('consultorioHorario').value),
        fisioterapeuta: document.getElementById('fisioterapeuta').value
      };
      res = this.servicio.registrarHorario(payload);
    }
    
    alert(res.mensaje);
    if (res.exito) {
      this.limpiarFormularioHorario();
      this.cargarHorarios();
      this.cargarAuditoria();
    }
  }
  
  cargarHorarioEnFormulario(id) {
    const horario = this.servicio.obtenerHorarios().find(h => h.id === id);
    if (!horario) return;
    
    this.horarioEditandoId = id;
    document.getElementById('fechaHorario').value = horario.fecha;
    document.getElementById('fechaHorario').disabled = true;
    document.getElementById('horaInicio').value = horario.horaInicio;
    document.getElementById('horaInicio').disabled = true;
    document.getElementById('horaFin').value = horario.horaFin;
    document.getElementById('horaFin').disabled = true;
    document.getElementById('consultorioHorario').value = horario.consultorioId;
    document.getElementById('consultorioHorario').disabled = true;
    document.getElementById('fisioterapeuta').value = horario.fisioterapeuta;
    document.getElementById('fisioterapeuta').disabled = true;
    
    document.getElementById('cupoHorario').value = horario.cupo;
    document.getElementById('estadoHorario').value = horario.estado;
    
    document.getElementById('btnGuardarHorario').textContent = 'Guardar Cambios';
    document.getElementById('btnCancelarEdicionHorario').style.display = 'inline-block';
  }
  
  limpiarFormularioHorario() {
    this.horarioEditandoId = null;
    document.getElementById('formHorario').reset();
    document.getElementById('fechaHorario').disabled = false;
    document.getElementById('horaInicio').disabled = false;
    document.getElementById('horaFin').disabled = false;
    document.getElementById('consultorioHorario').disabled = false;
    document.getElementById('fisioterapeuta').disabled = false;
    
    document.getElementById('btnGuardarHorario').textContent = 'Guardar horario';
    document.getElementById('btnCancelarEdicionHorario').style.display = 'none';
  }

  eliminarHorario(id) {
    if (!confirm('¿Está seguro de eliminar este horario?')) return;
    const res = this.servicio.eliminarHorario(id);
    alert(res.mensaje);
    if (res.exito) {
      this.cargarHorarios();
      this.cargarAuditoria();
    }
  }

  inactivarHorario(id) {
    const res = this.servicio.inactivarHorario(id);
    alert(res.mensaje);
    if (res.exito) {
      this.cargarHorarios();
      this.cargarAuditoria();
    }
  }

  guardarConsultorio(e) {
    e.preventDefault();
    const res = this.servicio.registrarConsultorio({
      nombre: document.getElementById('nombreConsultorio').value,
      capacidad: document.getElementById('capacidadConsultorio').value
    });
    alert(res.mensaje);
    if (res.exito) {
      document.getElementById('formConsultorio').reset();
      this.cargarConsultorios();
      this.cargarAuditoria();
    }
  }
  
  eliminarConsultorio(id) {
    if (!confirm('¿Está seguro de eliminar este consultorio?')) return;
    const res = this.servicio.eliminarConsultorio(id);
    alert(res.mensaje);
    if (res.exito) {
      this.cargarConsultorios();
      this.cargarAuditoria();
    }
  }

  cargarConsultorios() {
    const select = document.getElementById('consultorioHorario');
    if (!select) return;
    select.innerHTML = '';
    const consultorios = this.servicio.obtenerConsultorios();
    
    consultorios.forEach((consultorio) => {
      const option = document.createElement('option');
      option.value = consultorio.id;
      option.textContent = consultorio.nombre;
      select.appendChild(option);
    });

    const lista = document.getElementById('listaConsultorios');
    if (!lista) return;
    
    lista.innerHTML = consultorios.map((c) => `
      <div class="item-card" style="display: flex; justify-content: space-between; align-items: center;">
        <div><strong>${c.nombre}</strong> · Capacidad ${c.capacidad} · ${c.estado}</div>
        <button class="secondary-btn" style="color: red; border-color: red;" data-action="eliminar-consultorio" data-id="${c.id}">Eliminar</button>
      </div>
    `).join('');
    
    document.querySelectorAll('[data-action="eliminar-consultorio"]').forEach(btn => {
      btn.addEventListener('click', (e) => this.eliminarConsultorio(Number(e.target.dataset.id)));
    });
  }

  cargarHorarios() {
    const lista = document.getElementById('listaHorarios');
    if (!lista) return;
    
    const fecha = document.getElementById('filtroFechaListado').value;
    const estado = document.getElementById('filtroEstadoListado').value;
    
    const filtroEstado = estado === 'Todos' ? null : estado;
    const horarios = this.servicio.listarHorariosPorDia(fecha, filtroEstado);
    
    if (!horarios.length) {
      lista.innerHTML = '<p>No hay horarios.</p>';
      return;
    }
    
    lista.innerHTML = horarios.map((h) => {
      const cons = this.servicio.obtenerConsultorios().find(c => c.id === h.consultorioId);
      const nombreCons = cons ? cons.nombre : 'Consultorio Desconocido';
      return `
      <div class="item-card" style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
        <div>
          <strong>${h.horaInicio}-${h.horaFin}</strong> · ${nombreCons} · 
          Cupo: ${h.citasAsignadas}/${h.cupo} · Fisioterapeuta: ${h.fisioterapeuta || 'N/A'} · 
          <span style="color: ${h.estado === 'Activo' ? 'green' : 'red'};">${h.estado}</span>
        </div>
        <div>
          <button class="secondary-btn" data-action="editar-horario" data-id="${h.id}">Editar</button>
          ${h.estado === 'Activo' ? `<button class="secondary-btn" data-action="inactivar-horario" data-id="${h.id}">Inactivar</button>` : ''}
          <button class="secondary-btn" style="color: red; border-color: red;" data-action="eliminar-horario" data-id="${h.id}">Eliminar</button>
        </div>
      </div>
    `}).join('');
    
    document.querySelectorAll('[data-action="editar-horario"]').forEach(btn => {
      btn.addEventListener('click', (e) => this.cargarHorarioEnFormulario(Number(e.target.dataset.id)));
    });
    document.querySelectorAll('[data-action="inactivar-horario"]').forEach(btn => {
      btn.addEventListener('click', (e) => this.inactivarHorario(Number(e.target.dataset.id)));
    });
    document.querySelectorAll('[data-action="eliminar-horario"]').forEach(btn => {
      btn.addEventListener('click', (e) => this.eliminarHorario(Number(e.target.dataset.id)));
    });
  }

  async cargarAuditoria() {
    const lista = document.getElementById('listaAuditoria');
    if (!lista) return;
    
    if (!this.auditoriaRepo) {
      import('../datos/AuditoriaRepo.js').then(({ AuditoriaRepo }) => {
        this.auditoriaRepo = new AuditoriaRepo();
        this.renderAuditoria(lista);
      });
    } else {
      this.renderAuditoria(lista);
    }
  }

  async renderAuditoria(lista) {
    try {
      const logs = await this.auditoriaRepo.listar() || [];
      if (logs.length === 0) {
        lista.innerHTML = '<p>No hay registros de auditoría</p>';
        return;
      }
      
      lista.innerHTML = logs.map((item) => {
        const fechaObj = new Date(item.fecha);
        const fechaStr = isNaN(fechaObj.getTime()) ? item.fecha : fechaObj.toLocaleString();
        return `
          <div class="item-card" style="font-size: 0.9em;">
            <small style="color: var(--muted);">${fechaStr}</small><br/>
            <strong>Acción:</strong> ${item.accion} <br/>
            <strong>Usuario ID:</strong> ${item.usuarioId} | <strong>Perfil:</strong> ${item.perfilNombre}
          </div>
        `;
      }).join('');
    } catch (error) {
      lista.innerHTML = '<p>Error al cargar la auditoría</p>';
    }
  }
}
