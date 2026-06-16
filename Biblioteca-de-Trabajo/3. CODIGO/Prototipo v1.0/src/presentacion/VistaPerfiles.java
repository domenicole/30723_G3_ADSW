package presentacion;

import negocio.ServicioPerfiles;
import negocio.GestorEventos;
import modelos.Usuario;
import modelos.Perfil;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import java.util.List;

public class VistaPerfiles extends JFrame {
    private ServicioPerfiles svc;
    private GestorEventos gestor;
    private JTable tabla;
    private DefaultTableModel modeloTabla;
    
    private JTextField txtId, txtNombre, txtDesc;
    private JComboBox<String> cbEstado;
    private JCheckBox chkCitas, chkPacientes, chkHorarios, chkPlanificacion, chkPerfiles;
    private JButton btnGuardar, btnLimpiar;

    public VistaPerfiles(GestorEventos gestor, Usuario u, Perfil p) {
        this.gestor = gestor;
        this.svc = new ServicioPerfiles(gestor, u, p);

        setTitle("FiCitas - Gestión de Perfiles (Administrador)");
        setSize(800, 500);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        // Tabla
        String[] columnas = {"ID", "Nombre", "Descripción", "Estado", "Permisos"};
        modeloTabla = new DefaultTableModel(columnas, 0);
        tabla = new JTable(modeloTabla);
        JScrollPane scrollPane = new JScrollPane(tabla);
        add(scrollPane, BorderLayout.CENTER);

        // Formulario (Arriba)
        JPanel panelForm = new JPanel(new GridLayout(6, 2, 5, 5));
        panelForm.setBorder(BorderFactory.createTitledBorder("Datos del Perfil"));

        panelForm.add(new JLabel("ID (0 para nuevo):"));
        txtId = new JTextField("0");
        txtId.setEditable(false);
        panelForm.add(txtId);

        panelForm.add(new JLabel("Nombre:"));
        txtNombre = new JTextField();
        panelForm.add(txtNombre);

        panelForm.add(new JLabel("Descripción:"));
        txtDesc = new JTextField();
        panelForm.add(txtDesc);

        panelForm.add(new JLabel("Estado:"));
        cbEstado = new JComboBox<>(new String[]{"Activo", "Inactivo"});
        cbEstado.setEnabled(false); // Solo se edita al modificar
        panelForm.add(cbEstado);

        // Checkboxes
        JPanel pnlChecks = new JPanel(new FlowLayout());
        chkCitas = new JCheckBox("Gestión Citas");
        chkPacientes = new JCheckBox("Gestión Pacientes");
        chkHorarios = new JCheckBox("Gestión Horarios");
        chkPlanificacion = new JCheckBox("Gestión Planificación");
        chkPerfiles = new JCheckBox("Gestión Perfiles");
        pnlChecks.add(chkCitas); pnlChecks.add(chkPacientes); pnlChecks.add(chkHorarios); pnlChecks.add(chkPlanificacion); pnlChecks.add(chkPerfiles);
        
        panelForm.add(new JLabel("Permisos:"));
        panelForm.add(pnlChecks);

        JPanel pnlBotones = new JPanel();
        btnGuardar = new JButton("Guardar");
        btnLimpiar = new JButton("Limpiar / Nuevo");
        JButton btnEditar = new JButton("Editar Seleccionado");
        
        pnlBotones.add(btnGuardar);
        pnlBotones.add(btnLimpiar);
        pnlBotones.add(btnEditar);

        // Header
        JPanel panelHeader = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        JButton btnCerrarSesion = new JButton("Cerrar Sesión");
        panelHeader.add(btnCerrarSesion);

        JPanel panelNorte = new JPanel(new BorderLayout());
        panelNorte.add(panelHeader, BorderLayout.NORTH);
        panelNorte.add(panelForm, BorderLayout.CENTER);
        panelNorte.add(pnlBotones, BorderLayout.SOUTH);
        
        add(panelNorte, BorderLayout.NORTH);

        // Listeners
        btnGuardar.addActionListener(e -> guardar());
        btnLimpiar.addActionListener(e -> limpiarFormulario());
        btnEditar.addActionListener(e -> cargarSeleccionado());
        btnCerrarSesion.addActionListener(e -> {
            dispose();
            new VistaLogin(this.gestor).setVisible(true);
        });

        cargarTabla();
    }

    private void cargarTabla() {
        modeloTabla.setRowCount(0);
        for (Perfil p : svc.obtenerPerfiles()) {
            modeloTabla.addRow(new Object[]{
                p.getId(), p.getNombre(), p.getDescripcion(), p.getEstado(), String.join(", ", p.getPermisos())
            });
        }
    }

    private void limpiarFormulario() {
        txtId.setText("0");
        txtNombre.setText("");
        txtDesc.setText("");
        cbEstado.setSelectedIndex(0);
        cbEstado.setEnabled(false);
        chkCitas.setSelected(false); chkPacientes.setSelected(false); chkHorarios.setSelected(false); chkPlanificacion.setSelected(false); chkPerfiles.setSelected(false);
    }

    private void cargarSeleccionado() {
        int fila = tabla.getSelectedRow();
        if (fila == -1) {
            JOptionPane.showMessageDialog(this, "Seleccione un perfil de la tabla.");
            return;
        }
        
        int id = (int) modeloTabla.getValueAt(fila, 0);
        Perfil p = svc.obtenerPerfiles().stream().filter(per -> per.getId() == id).findFirst().orElse(null);
        if (p != null) {
            txtId.setText(String.valueOf(p.getId()));
            txtNombre.setText(p.getNombre());
            txtDesc.setText(p.getDescripcion());
            cbEstado.setSelectedItem(p.getEstado());
            cbEstado.setEnabled(true);
            
            chkCitas.setSelected(p.getPermisos().contains("GESTION_CITAS"));
            chkPacientes.setSelected(p.getPermisos().contains("GESTION_PACIENTES"));
            chkHorarios.setSelected(p.getPermisos().contains("GESTION_HORARIOS"));
            chkPlanificacion.setSelected(p.getPermisos().contains("GESTION_PLANIFICACION"));
            chkPerfiles.setSelected(p.getPermisos().contains("GESTION_PERFILES"));
        }
    }

    private void guardar() {
        int id = Integer.parseInt(txtId.getText());
        String nombre = txtNombre.getText();
        String desc = txtDesc.getText();
        String estado = cbEstado.getSelectedItem().toString();
        
        List<String> permisos = new ArrayList<>();
        if (chkCitas.isSelected()) permisos.add("GESTION_CITAS");
        if (chkPacientes.isSelected()) permisos.add("GESTION_PACIENTES");
        if (chkHorarios.isSelected()) permisos.add("GESTION_HORARIOS");
        if (chkPlanificacion.isSelected()) permisos.add("GESTION_PLANIFICACION");
        if (chkPerfiles.isSelected()) permisos.add("GESTION_PERFILES");

        if (permisos.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Debe seleccionar al menos un permiso.");
            return;
        }

        ServicioPerfiles.OpResult res;
        if (id == 0) {
            res = svc.registrarPerfil(nombre, desc, permisos);
        } else {
            res = svc.modificarPerfil(id, nombre, desc, estado, permisos);
        }

        if (res.exito) {
            JOptionPane.showMessageDialog(this, res.mensaje);
            limpiarFormulario();
            cargarTabla();
        } else {
            JOptionPane.showMessageDialog(this, res.mensaje, "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
}
