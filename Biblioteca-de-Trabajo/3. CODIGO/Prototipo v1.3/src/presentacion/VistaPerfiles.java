package presentacion;

import negocio.ServicioPerfiles;
import negocio.GestorEventos;
import modelos.Usuario;
import modelos.Perfil;
import negocio.ServicioUsuarios;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import java.util.List;

public class VistaPerfiles extends JFrame {
    private ServicioPerfiles svcPerfiles;
    private ServicioUsuarios svcUsuarios;
    private GestorEventos gestor;
    private JTable tabla;
    private DefaultTableModel modeloTabla;
    
    private JTextField txtId, txtNombre, txtDesc;
    private JComboBox<String> cbEstado;
    private JCheckBox chkCitas, chkPacientes, chkHorarios, chkPlanificacion, chkPerfiles;
    private JButton btnGuardar, btnLimpiar;

    // Elementos pestaña Usuarios
    private JTable tablaUsuarios;
    private DefaultTableModel modeloTablaUsuarios;
    private JTextField txtCorreoUsuario, txtPassUsuario;
    private JComboBox<String> cbPerfilesUsuario;
    private JButton btnGuardarUsuario;

    public VistaPerfiles(GestorEventos gestor, Usuario u, Perfil p) {
        this.gestor = gestor;
        this.svcPerfiles = new ServicioPerfiles(gestor, u, p);
        this.svcUsuarios = new ServicioUsuarios(gestor, u);

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

        // Contenedor de la pestaña Perfiles
        JPanel panelTabPerfiles = new JPanel(new BorderLayout());
        JPanel panelNortePerfiles = new JPanel(new BorderLayout());
        panelNortePerfiles.add(panelForm, BorderLayout.CENTER);
        panelNortePerfiles.add(pnlBotones, BorderLayout.SOUTH);
        panelTabPerfiles.add(panelNortePerfiles, BorderLayout.NORTH);
        panelTabPerfiles.add(scrollPane, BorderLayout.CENTER);

        // --- Pestaña de Usuarios ---
        JPanel panelTabUsuarios = new JPanel(new BorderLayout());
        
        // Formulario Usuarios
        JPanel formUsuarios = new JPanel(new GridLayout(3, 2, 5, 5));
        formUsuarios.setBorder(BorderFactory.createTitledBorder("Registrar Nuevo Usuario"));
        
        formUsuarios.add(new JLabel("Correo Electrónico:"));
        txtCorreoUsuario = new JTextField();
        formUsuarios.add(txtCorreoUsuario);
        
        formUsuarios.add(new JLabel("Contraseña:"));
        txtPassUsuario = new JTextField();
        formUsuarios.add(txtPassUsuario);
        
        formUsuarios.add(new JLabel("Asignar Perfil:"));
        cbPerfilesUsuario = new JComboBox<>();
        formUsuarios.add(cbPerfilesUsuario);
        
        btnGuardarUsuario = new JButton("Crear Usuario");
        JPanel pnlBotonesUsu = new JPanel();
        pnlBotonesUsu.add(btnGuardarUsuario);
        
        JPanel panelNorteUsu = new JPanel(new BorderLayout());
        panelNorteUsu.add(formUsuarios, BorderLayout.CENTER);
        panelNorteUsu.add(pnlBotonesUsu, BorderLayout.SOUTH);
        panelTabUsuarios.add(panelNorteUsu, BorderLayout.NORTH);
        
        // Tabla Usuarios
        String[] colUsu = {"ID", "Correo", "Perfil", "Estado"};
        modeloTablaUsuarios = new DefaultTableModel(colUsu, 0);
        tablaUsuarios = new JTable(modeloTablaUsuarios);
        panelTabUsuarios.add(new JScrollPane(tablaUsuarios), BorderLayout.CENTER);

        // --- Tabs ---
        JTabbedPane pestañas = new JTabbedPane();
        pestañas.addTab("Gestión de Perfiles", panelTabPerfiles);
        pestañas.addTab("Gestión de Usuarios", panelTabUsuarios);

        add(pestañas, BorderLayout.CENTER);

        // Header Global
        JPanel panelHeader = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        JButton btnCerrarSesion = new JButton("Cerrar Sesión");
        panelHeader.add(btnCerrarSesion);
        add(panelHeader, BorderLayout.NORTH);

        // Listeners Perfiles
        btnGuardar.addActionListener(e -> guardar());
        btnLimpiar.addActionListener(e -> limpiarFormulario());
        btnEditar.addActionListener(e -> cargarSeleccionado());
        btnCerrarSesion.addActionListener(e -> {
            dispose();
            new VistaLogin(this.gestor).setVisible(true);
        });

        // Listeners Usuarios
        btnGuardarUsuario.addActionListener(e -> guardarUsuario());
        
        // Actualizar combobox de perfiles al cambiar de pestaña
        pestañas.addChangeListener(e -> {
            if (pestañas.getSelectedIndex() == 1) {
                cargarComboPerfiles();
            }
        });

        cargarTabla();
        cargarTablaUsuarios();
    }

    private void cargarTabla() {
        modeloTabla.setRowCount(0);
        for (Perfil p : svcPerfiles.obtenerPerfiles()) {
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
        Perfil p = svcPerfiles.obtenerPerfiles().stream().filter(per -> per.getId() == id).findFirst().orElse(null);
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
            res = svcPerfiles.registrarPerfil(nombre, desc, permisos);
        } else {
            res = svcPerfiles.modificarPerfil(id, nombre, desc, estado, permisos);
        }

        if (res.exito) {
            JOptionPane.showMessageDialog(this, res.mensaje);
            limpiarFormulario();
            cargarTabla();
        } else {
            JOptionPane.showMessageDialog(this, res.mensaje, "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    private void cargarComboPerfiles() {
        cbPerfilesUsuario.removeAllItems();
        for (Perfil p : svcPerfiles.obtenerPerfiles()) {
            if (p.getEstado().equals("Activo")) {
                cbPerfilesUsuario.addItem(p.getId() + " - " + p.getNombre());
            }
        }
    }

    private void cargarTablaUsuarios() {
        modeloTablaUsuarios.setRowCount(0);
        for (Usuario u : svcUsuarios.obtenerUsuarios()) {
            Perfil p = svcPerfiles.obtenerPerfiles().stream().filter(per -> per.getId() == u.getPerfilId()).findFirst().orElse(null);
            String nombrePerfil = p != null ? p.getNombre() : "Desconocido";
            modeloTablaUsuarios.addRow(new Object[]{ u.getId(), u.getCorreo(), nombrePerfil, u.getEstado() });
        }
    }

    private void guardarUsuario() {
        String correo = txtCorreoUsuario.getText();
        String pass = txtPassUsuario.getText();
        if (cbPerfilesUsuario.getSelectedItem() == null) {
            JOptionPane.showMessageDialog(this, "Debe seleccionar un perfil.");
            return;
        }
        
        String perfilSeleccionado = cbPerfilesUsuario.getSelectedItem().toString();
        int perfilId = Integer.parseInt(perfilSeleccionado.split(" - ")[0]);

        ServicioUsuarios.OpResult res = svcUsuarios.registrarUsuario(correo, pass, perfilId);
        if (res.exito) {
            JOptionPane.showMessageDialog(this, res.mensaje);
            txtCorreoUsuario.setText("");
            txtPassUsuario.setText("");
            cargarTablaUsuarios();
        } else {
            JOptionPane.showMessageDialog(this, res.mensaje, "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
}
