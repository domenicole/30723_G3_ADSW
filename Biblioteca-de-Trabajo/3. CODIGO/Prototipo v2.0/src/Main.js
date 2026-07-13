import { VistaLogin } from './presentacion/VistaLogin.js';
import { GestorEventos } from './negocio/GestorEventos.js';
import { LogAuditoriaObserver } from './negocio/LogAuditoriaObserver.js';
import { NotificacionObserver } from './negocio/NotificacionObserver.js';
import { PacienteRepo } from './datos/PacienteRepo.js';
import { NotificacionRepo } from './datos/NotificacionRepo.js';
import { CitaRepo } from './datos/CitaRepo.js';
import { PerfilRepo } from './datos/PerfilRepo.js';
import { UsuarioRepo } from './datos/UsuarioRepo.js';
import { AuditoriaRepo } from './datos/AuditoriaRepo.js';

const gestor = new GestorEventos();
const pacienteRepo = new PacienteRepo();
const notificacionRepo = new NotificacionRepo();
const citaRepo = new CitaRepo();
const perfilRepo = new PerfilRepo();
const usuarioRepo = new UsuarioRepo();
const auditoriaRepo = new AuditoriaRepo();

gestor.suscribir(new LogAuditoriaObserver(auditoriaRepo));
gestor.suscribir(new NotificacionObserver(gestor, pacienteRepo, notificacionRepo));

window.appState = {
  gestor,
  pacienteRepo,
  notificacionRepo,
  citaRepo,
  perfilRepo,
  usuarioRepo,
  auditoriaRepo,
  currentUser: null,
  currentProfile: null,
};

window.addEventListener('DOMContentLoaded', () => {
  new VistaLogin(gestor);
});
