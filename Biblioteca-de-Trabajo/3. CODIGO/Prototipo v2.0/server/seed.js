require('dotenv').config();
const bcrypt = require('bcrypt');
const { conectarDB } = require('./db');

const USUARIOS_PRUEBA = [
  { correo: 'admin@ficitas.com', password: '12345', perfil: 'Administrador' },
  { correo: 'auxiliar@ficitas.com', password: '12345', perfil: 'Auxiliar' },
];

async function seed() {
  const db = await conectarDB();
  const coleccion = db.collection('usuarios');

  for (const datos of USUARIOS_PRUEBA) {
    const existente = await coleccion.findOne({ correo: datos.correo });
    if (existente) {
      console.log(`Ya existe: ${datos.correo}, se omite.`);
      continue;
    }
    await coleccion.insertOne({
      id: Date.now() + Math.floor(Math.random() * 1000),
      correo: datos.correo,
      password: await bcrypt.hash(datos.password, 10),
      perfil: datos.perfil,
      estado: 'Activo',
    });
    console.log(`Usuario creado: ${datos.correo}`);
  }

  process.exit(0);
}

seed().catch((error) => {
  console.error('Error al sembrar usuarios:', error);
  process.exit(1);
});
