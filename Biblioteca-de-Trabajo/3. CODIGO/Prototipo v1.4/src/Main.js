import { VistaLogin } from './presentacion/VistaLogin.js';
import { GestorEventos } from './negocio/GestorEventos.js';
import { LogAuditoriaObserver } from './negocio/LogAuditoriaObserver.js';

const gestor = new GestorEventos();
gestor.suscribir(new LogAuditoriaObserver());

window.addEventListener('DOMContentLoaded', () => {
  new VistaLogin(gestor);
});
