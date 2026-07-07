import { ServicioPlanificacion } from '../negocio/ServicioPlanificacion.js';

export class VistaPlanificacion {
  constructor(gestor, usuario) {
    this.gestor = gestor;
    this.usuario = usuario;
    this.servicio = new ServicioPlanificacion(gestor, usuario);
    this.render();
  }

  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="dashboard-shell">
        <aside class="sidebar">
          <h2>FiCitas</h2>
          <p>Panel de planificación</p>
          <button class="menu-btn active" data-view="planificacion">Planificación</button>
          <button class="menu-btn" data-view="consultorios">Consultorios</button>
          <button class="menu-btn" data-view="auditoria">Auditoría</button>
        </aside>
        <main class="main-panel">
          <section id="planificacion" class="view-card active">
            <h3>Registrar horario</h3>
            <form id="formHorario" class="form-grid">
              <label>Fecha<input id="fechaHorario" type="date" required /></label>
              <label>Hora inicio<input id="horaInicio" type="time" required /></label>
              <label>Hora fin<input id="horaFin" type="time" required /></label>
              <label>Cupo mínimo<input id="cupoHorario" type="number" min="1" value="1" required /></label>
              <label>Estado<select id="estadoHorario"><option>Activo</option><option>Inactivo</option></select></label>
              <label>Fisioterapeuta<input id="fisioterapeuta" /></label>
              <label>Consultorio<select id="consultorioHorario"></select></label>
              <button type="submit">Guardar horario</button>
            </form>
            <h3>Horarios del día</h3>
            <div id="listaHorarios"></div>
          </section>

          <section id="consultorios" class="view-card">
            <h3>Registrar consultorio</h3>
            <form id="formConsultorio" class="form-grid">
              <label>Nombre<input id="nombreConsultorio" required /></label>
              <label>Capacidad<input id="capacidadConsultorio" type="number" min="1" required /></label>
              <button type="submit">Guardar consultorio</button>
            </form>
            <div id="listaConsultorios"></div>
          </section>

          <section id="auditoria" class="view-card">
            <h3>Auditoría</h3>
            <div id="listaAuditoria"></div>
          </section>
        </main>
      </div>
    `;

    this.cargarConsultorios();
    this.cargarHorarios();
    this.cargarAuditoria();
    document.getElementById('formHorario').addEventListener('submit', (e) => this.guardarHorario(e));
    document.getElementById('formConsultorio').addEventListener('submit', (e) => this.guardarConsultorio(e));
    document.querySelectorAll('.menu-btn').forEach((btn) => btn.addEventListener('click', () => this.cambiarVista(btn.dataset.view)));
  }

  cambiarVista(vista) {
    document.querySelectorAll('.view-card').forEach((card) => card.classList.toggle('active', card.id === vista));
    document.querySelectorAll('.menu-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.view === vista));
  }

  guardarHorario(e) {
    e.preventDefault();
    const payload = {
      fecha: document.getElementById('fechaHorario').value,
      horaInicio: document.getElementById('horaInicio').value,
      horaFin: document.getElementById('horaFin').value,
      cupo: document.getElementById('cupoHorario').value,
      estado: document.getElementById('estadoHorario').value,
      consultorioId: Number(document.getElementById('consultorioHorario').value),
      fisioterapeuta: document.getElementById('fisioterapeuta').value
    };
    const res = this.servicio.registrarHorario(payload);
    alert(res.mensaje);
    this.cargarHorarios();
  }

  guardarConsultorio(e) {
    e.preventDefault();
    const res = this.servicio.registrarConsultorio({
      nombre: document.getElementById('nombreConsultorio').value,
      capacidad: document.getElementById('capacidadConsultorio').value
    });
    alert(res.mensaje);
    this.cargarConsultorios();
  }

  cargarConsultorios() {
    const select = document.getElementById('consultorioHorario');
    if (!select) return;
    select.innerHTML = '';
    this.servicio.obtenerConsultorios().forEach((consultorio) => {
      const option = document.createElement('option');
      option.value = consultorio.id;
      option.textContent = consultorio.nombre;
      select.appendChild(option);
    });

    const lista = document.getElementById('listaConsultorios');
    if (!lista) return;
    lista.innerHTML = this.servicio.obtenerConsultorios().map((c) => `<div class="item-card">${c.nombre} · Capacidad ${c.capacidad} · ${c.estado}</div>`).join('');
  }

  cargarHorarios() {
    const lista = document.getElementById('listaHorarios');
    if (!lista) return;
    const fecha = document.getElementById('fechaHorario').value || new Date().toISOString().split('T')[0];
    const horarios = this.servicio.listarHorariosPorDia(fecha, 'Activo');
    lista.innerHTML = horarios.length ? horarios.map((h) => `<div class="item-card">${h.fecha} · ${h.horaInicio}-${h.horaFin} · Cupo ${h.cupo} · ${h.fisioterapeuta || 'Sin asignar'}</div>`).join('') : '<p>No hay horarios.</p>';
  }

  cargarAuditoria() {
    const lista = document.getElementById('listaAuditoria');
    if (!lista) return;
    lista.innerHTML = this.servicio.obtenerAuditoria().map((item) => `<div class="item-card">${item.fecha} · ${item.mensaje}</div>`).join('');
  }
}
