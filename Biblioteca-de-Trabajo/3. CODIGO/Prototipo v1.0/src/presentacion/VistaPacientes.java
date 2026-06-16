package presentacion;

import negocio.ServicioPacientes;
import negocio.ValidacionDecorador;
import negocio.GestorEventos;
import modelos.Usuario;
import modelos.Perfil;
import modelos.Paciente;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class VistaPacientes extends JFrame {
    private ValidacionDecorador svcDecorado;
    private GestorEventos gestor;
    private JTable tabla;
    private DefaultTableModel modeloTabla;
    
    private JTextField txtId, txtCedula, txtNombre, txtTelefono, txtFecha, txtEdad, txtDomicilio, txtOcupacion;
    private JComboBox<String> cbEstadoCivil;
    private JButton btnGuardar, btnLimpiar;

    public VistaPacientes(GestorEventos gestor, Usuario u, Perfil p) {
        this.gestor = gestor;
        this.svcDecorado = new ValidacionDecorador(new ServicioPacientes());

        setTitle("FiCitas - Gestión de Pacientes (Auxiliar)");
        setSize(900, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        // Tabla
        String[] columnas = {"Cédula", "Nombre", "Teléfono", "Domicilio", "Ocupación", "F. Nac", "Estado Civil", "Estado"};
        modeloTabla = new DefaultTableModel(columnas, 0);
        tabla = new JTable(modeloTabla);
        JScrollPane scrollPane = new JScrollPane(tabla);
        add(scrollPane, BorderLayout.CENTER);

        // Formulario (Arriba)
        JPanel panelForm = new JPanel(new GridLayout(5, 4, 5, 5));
        panelForm.setBorder(BorderFactory.createTitledBorder("Datos del Paciente"));

        txtId = new JTextField("0"); // Oculto lógico
        
        panelForm.add(new JLabel("Cédula (10 díg):"));
        txtCedula = new JTextField();
        panelForm.add(txtCedula);

        panelForm.add(new JLabel("Nombre:"));
        txtNombre = new JTextField();
        panelForm.add(txtNombre);

        panelForm.add(new JLabel("Teléfono:"));
        txtTelefono = new JTextField();
        panelForm.add(txtTelefono);

        panelForm.add(new JLabel("Fecha Nac. (YYYY-MM-DD):"));
        txtFecha = new JTextField();
        panelForm.add(txtFecha);

        panelForm.add(new JLabel("Edad Calculada:"));
        txtEdad = new JTextField();
        panelForm.add(txtEdad);

        panelForm.add(new JLabel("Domicilio:"));
        txtDomicilio = new JTextField();
        panelForm.add(txtDomicilio);

        panelForm.add(new JLabel("Ocupación:"));
        txtOcupacion = new JTextField();
        panelForm.add(txtOcupacion);

        panelForm.add(new JLabel("Estado Civil:"));
        cbEstadoCivil = new JComboBox<>(new String[]{"Soltero", "Casado", "Divorciado", "Viudo", "UnionLibre"});
        panelForm.add(cbEstadoCivil);

        JPanel pnlBotones = new JPanel();
        btnGuardar = new JButton("Guardar");
        btnLimpiar = new JButton("Limpiar / Nuevo");
        JButton btnEditar = new JButton("Editar Seleccionado");
        JButton btnInactivar = new JButton("Alternar Estado Seleccionado");
        
        pnlBotones.add(btnGuardar);
        pnlBotones.add(btnLimpiar);
        pnlBotones.add(btnEditar);
        pnlBotones.add(btnInactivar);

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
        btnInactivar.addActionListener(e -> cambiarEstadoSeleccionado());
        btnCerrarSesion.addActionListener(e -> {
            dispose();
            new VistaLogin(this.gestor).setVisible(true);
        });

        cargarTabla();
    }

    private void cargarTabla() {
        modeloTabla.setRowCount(0);
        for (Paciente p : svcDecorado.obtenerPacientes()) {
            modeloTabla.addRow(new Object[]{
                p.getCedula(), p.getNombre(), p.getTelefono(), p.getDomicilio(), p.getOcupacion(), p.getFechaNacimiento(), p.getEstadoCivil(), p.getEstado()
            });
        }
    }

    private void limpiarFormulario() {
        txtId.setText("0");
        txtCedula.setText(""); txtCedula.setEnabled(true);
        txtNombre.setText(""); txtNombre.setEnabled(true);
        txtTelefono.setText("");
        txtFecha.setText(""); txtFecha.setEnabled(true);
        txtEdad.setText(""); txtEdad.setEnabled(true);
        txtDomicilio.setText("");
        txtOcupacion.setText("");
        cbEstadoCivil.setSelectedIndex(0);
    }

    private void cargarSeleccionado() {
        int fila = tabla.getSelectedRow();
        if (fila == -1) {
            JOptionPane.showMessageDialog(this, "Seleccione un paciente de la tabla.");
            return;
        }
        
        String cedula = (String) modeloTabla.getValueAt(fila, 0);
        Paciente p = svcDecorado.obtenerPacientes().stream().filter(pac -> pac.getCedula().equals(cedula)).findFirst().orElse(null);
        if (p != null) {
            txtId.setText(String.valueOf(p.getId()));
            txtCedula.setText(p.getCedula()); txtCedula.setEnabled(false); // REQ004: Restriccion
            txtNombre.setText(p.getNombre()); txtNombre.setEnabled(false); // REQ004: Restriccion
            txtTelefono.setText(p.getTelefono());
            txtFecha.setText(p.getFechaNacimiento()); txtFecha.setEnabled(false); // REQ004: Restriccion
            txtEdad.setText(""); txtEdad.setEnabled(false); // REQ004: Restriccion
            txtDomicilio.setText(p.getDomicilio());
            txtOcupacion.setText(p.getOcupacion());
            cbEstadoCivil.setSelectedItem(p.getEstadoCivil());
            
            JOptionPane.showMessageDialog(this, "Modo Edición: Solo Domicilio, Ocupación, Teléfono y Estado Civil pueden ser alterados.");
        }
    }

    private void cambiarEstadoSeleccionado() {
        int fila = tabla.getSelectedRow();
        if (fila == -1) {
            JOptionPane.showMessageDialog(this, "Seleccione un paciente de la tabla.");
            return;
        }
        
        String cedula = (String) modeloTabla.getValueAt(fila, 0);
        Paciente p = svcDecorado.obtenerPacientes().stream().filter(pac -> pac.getCedula().equals(cedula)).findFirst().orElse(null);
        if (p != null) {
            String nuevoEstado = p.getEstado().equals("Activo") ? "Inactivo" : "Activo";
            ServicioPacientes.OpResult res = svcDecorado.cambiarEstado(p.getId(), nuevoEstado);
            if (res.exito) {
                cargarTabla();
                JOptionPane.showMessageDialog(this, "Estado cambiado.");
            } else {
                JOptionPane.showMessageDialog(this, res.mensaje, "Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    private void guardar() {
        int id = Integer.parseInt(txtId.getText());
        String cedula = txtCedula.getText();
        String nombre = txtNombre.getText();
        String telefono = txtTelefono.getText();
        String fecha = txtFecha.getText();
        String edad = txtEdad.getText();
        String domicilio = txtDomicilio.getText();
        String ocupacion = txtOcupacion.getText();
        String estadoCivil = cbEstadoCivil.getSelectedItem().toString();

        ServicioPacientes.OpResult res;
        if (id == 0) {
            res = svcDecorado.registrarPaciente(cedula, nombre, telefono, fecha, domicilio, ocupacion, estadoCivil, edad);
        } else {
            res = svcDecorado.modificarPaciente(id, domicilio, telefono, ocupacion, estadoCivil);
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
