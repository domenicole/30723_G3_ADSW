package presentacion;

import negocio.DisponibilidadDecorador;
import negocio.ServicioCitas;
import negocio.GestorEventos;
import modelos.Cita;
import modelos.Usuario;
import modelos.Perfil;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

public class VistaCitas extends JPanel {
    private DisponibilidadDecorador svcCitasDecorado;
    private GestorEventos gestor;
    
    private JTable tabla;
    private DefaultTableModel modeloTabla;
    
    private JTextField txtId, txtPacienteId, txtServicio, txtConsultorio, txtFecha, txtHora, txtDuracion;
    private JButton btnGuardar, btnLimpiar, btnCancelar;
    
    public VistaCitas(GestorEventos gestor, Usuario u, Perfil p) {
        this.gestor = gestor;
        this.svcCitasDecorado = new DisponibilidadDecorador(new ServicioCitas(gestor, u.getId()));

        setLayout(new BorderLayout());

        String[] columnas = {"Cód", "Pac ID", "Servicio", "Cons", "Fecha", "Hora", "Dur (m)", "Est", "Motivo"};
        modeloTabla = new DefaultTableModel(columnas, 0);
        tabla = new JTable(modeloTabla);
        add(new JScrollPane(tabla), BorderLayout.CENTER);

        JPanel panelForm = new JPanel(new GridLayout(4, 4, 5, 5));
        panelForm.setBorder(BorderFactory.createTitledBorder("Agendar Cita"));

        txtId = new JTextField("0");

        panelForm.add(new JLabel("ID Paciente:"));
        txtPacienteId = new JTextField();
        panelForm.add(txtPacienteId);

        panelForm.add(new JLabel("Servicio Médico:"));
        txtServicio = new JTextField();
        panelForm.add(txtServicio);

        panelForm.add(new JLabel("Consultorio:"));
        txtConsultorio = new JTextField();
        panelForm.add(txtConsultorio);

        panelForm.add(new JLabel("Fecha (YYYY-MM-DD):"));
        txtFecha = new JTextField();
        panelForm.add(txtFecha);

        panelForm.add(new JLabel("Hora (HH:MM):"));
        txtHora = new JTextField();
        panelForm.add(txtHora);

        panelForm.add(new JLabel("Duración (min):"));
        txtDuracion = new JTextField();
        panelForm.add(txtDuracion);

        JPanel pnlBotones = new JPanel();
        btnGuardar = new JButton("Agendar");
        btnLimpiar = new JButton("Limpiar");
        btnCancelar = new JButton("Cancelar Cita Seleccionada");
        
        pnlBotones.add(btnGuardar);
        pnlBotones.add(btnLimpiar);
        pnlBotones.add(btnCancelar);

        JPanel panelNorte = new JPanel(new BorderLayout());
        panelNorte.add(panelForm, BorderLayout.CENTER);
        panelNorte.add(pnlBotones, BorderLayout.SOUTH);
        
        add(panelNorte, BorderLayout.NORTH);

        btnGuardar.addActionListener(e -> guardar());
        btnLimpiar.addActionListener(e -> limpiarFormulario());
        btnCancelar.addActionListener(e -> cancelarCitaSeleccionada());

        cargarTabla();
    }

    private void cargarTabla() {
        modeloTabla.setRowCount(0);
        for (Cita c : svcCitasDecorado.obtenerTodas()) {
            modeloTabla.addRow(new Object[]{
                c.getCodigo(), c.getPacienteId(), c.getServicio(), c.getConsultorio(), c.getFecha(), c.getHora(), c.getDuracion(), c.getEstado(), c.getMotivoCancelacion()
            });
        }
    }

    private void limpiarFormulario() {
        txtId.setText("0");
        txtPacienteId.setText("");
        txtServicio.setText("");
        txtConsultorio.setText("");
        txtFecha.setText("");
        txtHora.setText("");
        txtDuracion.setText("");
    }

    private void guardar() {
        try {
            int pacId = Integer.parseInt(txtPacienteId.getText());
            String serv = txtServicio.getText();
            String cons = txtConsultorio.getText();
            String fecha = txtFecha.getText();
            String hora = txtHora.getText();
            int dur = Integer.parseInt(txtDuracion.getText());

            ServicioCitas.OpResult res = svcCitasDecorado.registrarCita(pacId, serv, cons, fecha, hora, dur);
            if (res.exito) {
                JOptionPane.showMessageDialog(this, res.mensaje);
                limpiarFormulario();
                cargarTabla();
            } else {
                JOptionPane.showMessageDialog(this, res.mensaje, "Error", JOptionPane.ERROR_MESSAGE);
            }
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Asegúrese de ingresar números válidos en ID y Duración.");
        }
    }

    private void cancelarCitaSeleccionada() {
        int fila = tabla.getSelectedRow();
        if (fila == -1) {
            JOptionPane.showMessageDialog(this, "Seleccione una cita.");
            return;
        }
        
        String codigo = (String) modeloTabla.getValueAt(fila, 0);
        Cita c = svcCitasDecorado.obtenerTodas().stream().filter(cita -> cita.getCodigo().equals(codigo)).findFirst().orElse(null);
        if (c != null) {
            if(c.getEstado().equals("Cancelada")) {
                JOptionPane.showMessageDialog(this, "La cita ya está cancelada.");
                return;
            }
            String motivo = JOptionPane.showInputDialog(this, "Ingrese el motivo de cancelación (Obligatorio):");
            if (motivo != null) {
                ServicioCitas.OpResult res = svcCitasDecorado.cancelarCita(c.getId(), motivo);
                if (res.exito) {
                    JOptionPane.showMessageDialog(this, res.mensaje);
                    cargarTabla();
                } else {
                    JOptionPane.showMessageDialog(this, res.mensaje, "Error", JOptionPane.ERROR_MESSAGE);
                }
            }
        }
    }
}
