require('dotenv').config();
const path = require('path');
const express = require('express');
const { conectarDB } = require('./db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/pacientes', require('./routes/pacientes'));
app.use('/api/citas', require('./routes/citas'));
app.use('/api/perfiles', require('./routes/perfiles'));
app.use('/api/auditoria', require('./routes/auditoria'));

const PORT = process.env.PORT || 3000;

conectarDB()
  .then(() => {
    console.log(`Conectado a MongoDB (base de datos "${process.env.MONGODB_DB || 'Ficitas'}")`);
    app.listen(PORT, () => console.log(`FiCitas Web escuchando en http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('No se pudo conectar a MongoDB:', error);
    process.exit(1);
  });
