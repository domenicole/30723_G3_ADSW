package view;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import model.Estudiante;
import controller.ControlEstudiante;
import java.util.List;

/**
 * Clase FormularioCrudEstudiante - Vista (Boundary)
 * Interfaz gráfica del CRUD de estudiantes
 * 3 Atributos: txtId, txtNombre, txtEdad
 * 6 Métodos: clickAgregar, clickActualizar, clickEliminar, clickMostrarTodo, mostrarMensaje, mostrarTablaEstudiantes
 */
public class FormularioCrudEstudiante extends JFrame {
    private ControlEstudiante controlador;

    // 3 Atributos especificados en el diagrama
    private JTextField txtId;
    private JTextField txtNombre;
    private JTextField txtEdad;

    // Componentes adicionales para la UI
    private JButton btnAgregar;
    private JButton btnActualizar;
    private JButton btnEliminar;
    private JButton btnMostrarTodo;
    private JTable tablaEstudiantes;
    private DefaultTableModel modeloTabla;


    public FormularioCrudEstudiante() {
        inicializarGUI();
    }

    public void setControlador(ControlEstudiante controlador) {
        this.controlador = controlador;
    }

    private void inicializarGUI() {
        setTitle("CRUD de Estudiantes");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1000, 700);
        setLocationRelativeTo(null);
        setResizable(true);

        JPanel panelPrincipal = new JPanel(new BorderLayout(10, 10));
        panelPrincipal.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        JPanel panelEntrada = new JPanel(new BorderLayout(10, 10));
        panelEntrada.setBorder(BorderFactory.createTitledBorder("Datos del Estudiante"));

        // Panel de campos
        JPanel panelCampos = new JPanel(new GridLayout(1, 6, 10, 10));
        panelCampos.add(new JLabel("ID:"));
        txtId = new JTextField();
        panelCampos.add(txtId);

        panelCampos.add(new JLabel("Nombre:"));
        txtNombre = new JTextField();
        panelCampos.add(txtNombre);

        panelCampos.add(new JLabel("Edad:"));
        txtEdad = new JTextField();
        panelCampos.add(txtEdad);

        panelEntrada.add(panelCampos, BorderLayout.NORTH);

        // Panel de botones
        JPanel panelBotones = new JPanel(new GridLayout(1, 4, 10, 10));
        
        btnAgregar = new JButton("Agregar");
        btnAgregar.addActionListener(e -> clickAgregar());
        panelBotones.add(btnAgregar);

        btnActualizar = new JButton("Actualizar");
        btnActualizar.addActionListener(e -> clickActualizar());
        panelBotones.add(btnActualizar);

        btnEliminar = new JButton("Eliminar");
        btnEliminar.addActionListener(e -> clickEliminar());
        panelBotones.add(btnEliminar);

        btnMostrarTodo = new JButton("Mostrar Todos");
        btnMostrarTodo.addActionListener(e -> clickMostrarTodo());
        panelBotones.add(btnMostrarTodo);

        panelEntrada.add(panelBotones, BorderLayout.SOUTH);

        panelPrincipal.add(panelEntrada, BorderLayout.NORTH);

        modeloTabla = new DefaultTableModel(new String[]{"ID", "Nombre", "Edad"}, 0);
        tablaEstudiantes = new JTable(modeloTabla);
        JScrollPane scrollTabla = new JScrollPane(tablaEstudiantes);
        scrollTabla.setBorder(BorderFactory.createTitledBorder("Lista de Estudiantes"));
        panelPrincipal.add(scrollTabla, BorderLayout.CENTER);

        add(panelPrincipal);
        setVisible(true);
    }

    /**
     * clickAgregar - Maneja el evento del botón Agregar
     */
    public void clickAgregar() {
        String id = txtId.getText().trim();
        String nombre = txtNombre.getText().trim();
        String edad = txtEdad.getText().trim();
        controlador.agregarEstudiante(id, nombre, edad);
        limpiarCampos();
    }

    /**
     * clickActualizar - Maneja el evento del botón Actualizar
     */
    public void clickActualizar() {
        String id = txtId.getText().trim();
        String nombre = txtNombre.getText().trim();
        String edad = txtEdad.getText().trim();
        controlador.actualizarEstudiante(id, nombre, edad);
        limpiarCampos();
    }

    /**
     * clickEliminar - Maneja el evento del botón Eliminar
     */
    public void clickEliminar() {
        String id = txtId.getText().trim();
        controlador.eliminarEstudiante(id);
        limpiarCampos();
    }

    /**
     * clickMostrarTodo - Maneja el evento del botón Mostrar Todos
     */
    public void clickMostrarTodo() {
        controlador.mostrarTodos();
    }

    /**
     * mostrarMensaje - Muestra un mensaje en el área de resultados
     */
    public void mostrarMensaje(String mensaje) {
        System.out.println(mensaje);
    }

    /**
     * mostrarTablaEstudiantes - Actualiza la tabla con la lista de estudiantes
     */
    public void mostrarTablaEstudiantes(List<Estudiante> estudiantes) {
        modeloTabla.setRowCount(0);
        for (Estudiante est : estudiantes) {
            modeloTabla.addRow(new Object[]{est.getId(), est.getNombre(), est.getEdad()});
        }
    }

    private void limpiarCampos() {
        txtId.setText("");
        txtNombre.setText("");
        txtEdad.setText("");
        txtId.requestFocus();
    }
}
