package presentacion;

import negocio.ServicioAutenticacion;
import negocio.GestorEventos;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class VistaLogin extends JFrame {
    private ServicioAutenticacion authSvc;
    private GestorEventos gestor;

    private JTextField txtCorreo;
    private JPasswordField txtPass;
    private JButton btnLogin;
    private JButton btnRecuperar;

    public VistaLogin(GestorEventos gestor) {
        this.gestor = gestor;
        this.authSvc = new ServicioAutenticacion(gestor);

        setTitle("FiCitas - Iniciar Sesión");
        setSize(350, 250);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        JPanel panelCentro = new JPanel(new GridLayout(3, 2, 10, 10));
        panelCentro.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        panelCentro.add(new JLabel("Correo:"));
        txtCorreo = new JTextField();
        panelCentro.add(txtCorreo);

        panelCentro.add(new JLabel("Contraseña:"));
        txtPass = new JPasswordField();
        panelCentro.add(txtPass);

        btnLogin = new JButton("Ingresar");
        btnRecuperar = new JButton("Recuperar Contraseña");

        JPanel panelSur = new JPanel();
        panelSur.add(btnLogin);
        panelSur.add(btnRecuperar);

        add(new JLabel("Bienvenido a FiCitas", SwingConstants.CENTER), BorderLayout.NORTH);
        add(panelCentro, BorderLayout.CENTER);
        add(panelSur, BorderLayout.SOUTH);

        btnLogin.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                ingresar();
            }
        });

        btnRecuperar.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                new VistaRecuperarContrasena(authSvc).setVisible(true);
            }
        });

        // Focalizar cursor al abrir ventana
        addWindowListener(new java.awt.event.WindowAdapter() {
            public void windowOpened(java.awt.event.WindowEvent e) {
                txtCorreo.requestFocusInWindow();
            }
        });
    }

    private void ingresar() {
        String correo = txtCorreo.getText();
        String pass = new String(txtPass.getPassword());

        ServicioAutenticacion.AuthResult res = authSvc.iniciarSesion(correo, pass);

        if (res.exito) {
            JOptionPane.showMessageDialog(this, "Bienvenido " + res.usuario.getCorreo());
            
            if (res.perfil.getNombre().equals("Administrador")) {
                dispose();
                new VistaPerfiles(gestor, res.usuario, res.perfil).setVisible(true);
            } else if (res.perfil.getNombre().equals("Auxiliar")) {
                dispose();
                new VistaPacientes(gestor, res.usuario, res.perfil).setVisible(true);
            } else {
                JOptionPane.showMessageDialog(this, "Dashboard para " + res.perfil.getNombre() + " en construcción.");
                // Limpiar campos para otro intento
                txtPass.setText("");
                txtCorreo.requestFocusInWindow();
            }
        } else {
            JOptionPane.showMessageDialog(this, res.mensaje, "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
}
