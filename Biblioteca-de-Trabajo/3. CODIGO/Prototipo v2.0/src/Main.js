import { VistaLogin } from './presentacion/VistaLogin.js';
import { GestorEventos } from './negocio/GestorEventos.js';
import { LogAuditoriaObserver } from './negocio/LogAuditoriaObserver.js';
import { NotificacionObserver } from './negocio/NotificacionObserver.js';
import { PacienteRepo } from './datos/PacienteRepo.js';
import { NotificacionRepo } from './datos/NotificacionRepo.js';
import { CitaRepo } from './datos/CitaRepo.js';
import { PerfilRepo } from './datos/PerfilRepo.js';
import { UsuarioRepo } from './datos/UsuarioRepo.js';

const gestor = new GestorEventos();
const pacienteRepo = new PacienteRepo();
const notificacionRepo = new NotificacionRepo();
const citaRepo = new CitaRepo();
const perfilRepo = new PerfilRepo();
const usuarioRepo = new UsuarioRepo();

gestor.suscribir(new LogAuditoriaObserver());
gestor.suscribir(new NotificacionObserver(gestor, pacienteRepo, notificacionRepo));

window.appState = { gestor, pacienteRepo, notificacionRepo, citaRepo, perfilRepo, usuarioRepo };

window.addEventListener('DOMContentLoaded', () => {
  new VistaLogin(gestor);
});
