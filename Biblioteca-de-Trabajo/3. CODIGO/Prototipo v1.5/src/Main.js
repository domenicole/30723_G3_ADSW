import { VistaLogin } from './presentacion/VistaLogin.js';
import { GestorEventos } from './negocio/GestorEventos.js';
import { LogAuditoriaObserver } from './negocio/LogAuditoriaObserver.js';
import { NotificacionObserver } from './negocio/NotificacionObserver.js';
import { PacienteRepo } from './datos/PacienteRepo.js';
import { NotificacionRepo } from './datos/NotificacionRepo.js';

const gestor = new GestorEventos();
const pacienteRepo = new PacienteRepo();
const notificacionRepo = new NotificacionRepo();

gestor.suscribir(new LogAuditoriaObserver());
gestor.suscribir(new NotificacionObserver(gestor, pacienteRepo, notificacionRepo));

window.appState = { gestor, pacienteRepo, notificacionRepo };

window.addEventListener('DOMContentLoaded', () => {
  new VistaLogin(gestor);
});
