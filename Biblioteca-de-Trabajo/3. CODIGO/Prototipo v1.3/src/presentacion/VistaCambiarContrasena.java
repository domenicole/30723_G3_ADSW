package presentacion;

import negocio.ServicioAutenticacion;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class VistaCambiarContrasena extends JFrame {
    private ServicioAutenticacion authSvc;
    private String correoUsuario;
    private JPasswordField txtNuevaPass;
    private JPasswordField txtConfirmarPass;

    public VistaCambiarContrasena(ServicioAutenticacion authSvc, String correo) {
        this.authSvc = authSvc;
        this.correoUsuario = correo;

        setTitle("FiCitas - Cambiar Contraseña");
        setSize(350, 200);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        JPanel panel = new JPanel(new GridLayout(4, 1, 5, 5));
        panel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        panel.add(new JLabel("Nueva contraseña:"));
        txtNuevaPass = new JPasswordField();
        panel.add(txtNuevaPass);

        panel.add(new JLabel("Confirmar nueva contraseña:"));
        txtConfirmarPass = new JPasswordField();
        panel.add(txtConfirmarPass);

        JButton btnGuardar = new JButton("Guardar Contraseña");

        add(panel, BorderLayout.CENTER);
        add(btnGuardar, BorderLayout.SOUTH);

        btnGuardar.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                guardar();
            }
        });
    }

    private void guardar() {
        String nuevaPass = new String(txtNuevaPass.getPassword());
        String confirmarPass = new String(txtConfirmarPass.getPassword());

        if (nuevaPass.isEmpty() || confirmarPass.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Debe llenar ambos campos.", "Error", JOptionPane.ERROR_MESSAGE);
            return;
        }

        if (!nuevaPass.equals(confirmarPass)) {
            JOptionPane.showMessageDialog(this, "Las contraseñas no coinciden. Intente de nuevo.", "Error", JOptionPane.ERROR_MESSAGE);
            return;
        }

        ServicioAutenticacion.AuthResult res = authSvc.cambiarContrasena(correoUsuario, nuevaPass);
        if (res.exito) {
            JOptionPane.showMessageDialog(this, res.mensaje);
            dispose(); // Cierra y vuelve al login que ya está abierto de fondo
        } else {
            JOptionPane.showMessageDialog(this, res.mensaje, "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
}
