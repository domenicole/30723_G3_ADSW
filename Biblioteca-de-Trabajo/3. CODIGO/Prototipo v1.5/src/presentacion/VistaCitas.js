import { DisponibilidadDecorador } from '../negocio/DisponibilidadDecorador.js';
import { ServicioCitas } from '../negocio/ServicioCitas.js';

export class VistaCitas {
  constructor(gestor) {
    this.gestor = gestor;
    this.svcCitasDecorado = new DisponibilidadDecorador(new ServicioCitas(gestor, 1));
  }

  render() {
    const container = document.getElementById('citasContainer');
    if (!container) return;
    container.innerHTML = `
      <div class="panel">
        <h2>Gestión de Citas</h2>
        <form id="formCita" class="form-grid">
          <label>ID Paciente<input id="pacienteId" required /></label>
          <label>Servicio<input id="servicio" required /></label>
          <label>Consultorio<input id="consultorio" required /></label>
          <label>Fecha<input id="fechaCita" type="date" required /></label>
          <label>Hora<input id="horaCita" type="time" required /></label>
          <label>Duración<input id="duracion" type="number" required /></label>
          <button type="submit">Agendar</button>
        </form>
        <table>
          <thead><tr><th>Paciente</th><th>Servicio</th><th>Fecha</th><th>Hora</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody id="tablaCitas"></tbody>
        </table>
      </div>
    `;

    document.getElementById('formCita').addEventListener('submit', (e) => this.guardar(e));
    this.cargarTabla();
  }

  cargarTabla() {
    const tbody = document.getElementById('tablaCitas');
    if (!tbody) return;
    tbody.innerHTML = '';
    this.svcCitasDecorado.obtenerTodas().forEach((c) => {
      const fila = document.createElement('tr');
      const acciones = `
        <button type="button" data-id="${c.id}" class="btn-cancelar">Cancelar</button>
        <button type="button" data-id="${c.id}" class="btn-reprogramar">Reprogramar</button>
      `;
      fila.innerHTML = `<td>${c.pacienteId}</td><td>${c.servicio}</td><td>${c.fecha}</td><td>${c.hora}</td><td>${c.estado}</td><td>${acciones}</td>`;
      tbody.appendChild(fila);
    });
    this.agregarHandlersTabla();
  }

  agregarHandlersTabla() {
    document.querySelectorAll('.btn-cancelar').forEach((btn) => {
      btn.addEventListener('click', () => this.cancelarCita(btn.dataset.id));
    });
    document.querySelectorAll('.btn-reprogramar').forEach((btn) => {
      btn.addEventListener('click', () => this.reprogramarCita(btn.dataset.id));
    });
  }

  cancelarCita(id) {
    const motivo = prompt('Ingrese motivo de cancelación:', 'Cliente canceló');
    if (motivo === null) return;
    const res = this.svcCitasDecorado.cancelarCita(id, motivo);
    alert(res.mensaje);
    if (res.exito) this.cargarTabla();
  }

  reprogramarCita(id) {
    const fecha = prompt('Nueva fecha (YYYY-MM-DD):');
    if (!fecha) return;
    const hora = prompt('Nueva hora (HH:MM):');
    if (!hora) return;
    const res = this.svcCitasDecorado.reprogramarCita(id, fecha, hora);
    alert(res.mensaje);
    if (res.exito) this.cargarTabla();
  }

  guardar(e) {
    e.preventDefault();
    const pacId = document.getElementById('pacienteId').value;
    const serv = document.getElementById('servicio').value;
    const cons = document.getElementById('consultorio').value;
    const fecha = document.getElementById('fechaCita').value;
    const hora = document.getElementById('horaCita').value;
    const dur = document.getElementById('duracion').value;
    const res = this.svcCitasDecorado.registrarCita(pacId, serv, cons, fecha, hora, dur);
    if (res.exito) {
      alert(res.mensaje);
      this.cargarTabla();
    }
  }
}
