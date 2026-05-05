import model.RepositorioEstudiantes;
import view.FormularioCrudEstudiante;
import controller.ControlEstudiante;
import javax.swing.SwingUtilities;

/**
 * Clase Principal - Punto de entrada de la aplicación
 * Inicializa la arquitectura MVC
 */
public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                // Crear el repositorio (persistencia)
                RepositorioEstudiantes repositorio = new RepositorioEstudiantes();

                // Crear la vista
                FormularioCrudEstudiante vista = new FormularioCrudEstudiante();

                // Crear el controlador y conectarlo con la vista y el repositorio
                ControlEstudiante controlador = new ControlEstudiante(repositorio, vista);
            }
        });
    }
}
