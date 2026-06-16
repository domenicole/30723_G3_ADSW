package presentacion;

import negocio.ServicioAutenticacion;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class VistaRecuperarContrasena extends JFrame {
    private ServicioAutenticacion authSvc;
    private JTextField txtCorreo;

    public VistaRecuperarContrasena(ServicioAutenticacion authSvc) {
        this.authSvc = authSvc;

        setTitle("FiCitas - Recuperar Contraseña");
        setSize(300, 150);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        JPanel panel = new JPanel(new GridLayout(2, 1, 10, 10));
        panel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        panel.add(new JLabel("Ingrese su correo registrado:"));
        txtCorreo = new JTextField();
        panel.add(txtCorreo);

        JButton btnEnviar = new JButton("Enviar Enlace");

        add(panel, BorderLayout.CENTER);
        add(btnEnviar, BorderLayout.SOUTH);

        btnEnviar.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                enviar();
            }
        });
    }

    private void enviar() {
        ServicioAutenticacion.AuthResult res = authSvc.recuperarContrasena(txtCorreo.getText());
        if (res.exito) {
            JOptionPane.showMessageDialog(this, res.mensaje);
            dispose();
        } else {
            JOptionPane.showMessageDialog(this, res.mensaje, "Aviso", JOptionPane.WARNING_MESSAGE);
        }
    }
}
