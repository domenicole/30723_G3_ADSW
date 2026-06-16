import negocio.GestorEventos;
import negocio.LogAuditoriaObserver;
import presentacion.VistaLogin;

public class Main {
    public static void main(String[] args) {
        // Inicializar Gestor de Eventos (Patrón Observer)
        GestorEventos gestor = new GestorEventos();
        
        // Registrar Observer de Auditoría
        LogAuditoriaObserver auditoriaObserver = new LogAuditoriaObserver();
        gestor.suscribir(auditoriaObserver);
        
        // Iniciar GUI (Presentación)
        java.awt.EventQueue.invokeLater(new Runnable() {
            public void run() {
                new VistaLogin(gestor).setVisible(true);
            }
        });
    }
}
