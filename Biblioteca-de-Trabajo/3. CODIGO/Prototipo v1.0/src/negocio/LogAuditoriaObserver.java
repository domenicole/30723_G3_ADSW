package negocio;

import datos.AuditoriaRepo;
import modelos.Auditoria;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class LogAuditoriaObserver implements IObservadorAuditoria {
    private AuditoriaRepo repo = new AuditoriaRepo();

    @Override
    public void registrar(String usuarioId, String rol, String accion, String detalles) {
        String fechaHora = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        Auditoria aud = new Auditoria(0, fechaHora, usuarioId, rol, accion, detalles);
        repo.registrar(aud);
        System.out.println("[AUDITORIA] " + fechaHora + " | Usuario: " + usuarioId + " (" + rol + ") | Acción: " + accion + " | Detalles: " + detalles);
    }
}
