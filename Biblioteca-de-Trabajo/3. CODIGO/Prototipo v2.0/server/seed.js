require('dotenv').config();
const bcrypt = require('bcrypt');
const { conectarDB } = require('./db');

const PERFILES_PRUEBA = [
  {
    id: 1,
    nombre: 'Administrador',
    descripcion: 'Acceso total a perfiles, planificación y gestión de usuarios',
    estado: 'Activo',
    permisos: ['GESTION_PERFILES', 'GESTION_USUARIOS', 'GESTION_PLANIFICACION', 'GESTION_PACIENTES', 'GESTION_CITAS'],
  },
  {
    id: 2,
    nombre: 'Auxiliar',
    descripcion: 'Acceso operativo a pacientes y citas',
    estado: 'Activo',
    permisos: ['GESTION_PACIENTES', 'GESTION_CITAS'],
  },
];

const USUARIOS_PRUEBA = [
  { correo: 'admin@ficitas.com', password: '12345', perfilId: 1 },
  { correo: 'auxiliar@ficitas.com', password: '12345', perfilId: 2 },
];

async function seed() {
  const db = await conectarDB();
  const coleccionPerfiles = db.collection('perfiles');
  const coleccion = db.collection('usuarios');

  for (const datos of PERFILES_PRUEBA) {
    const existente = await coleccionPerfiles.findOne({ id: datos.id });
    if (existente) {
      console.log(`Ya existe perfil: ${datos.nombre}, se omite.`);
      continue;
    }
    await coleccionPerfiles.insertOne(datos);
    console.log(`Perfil creado: ${datos.nombre}`);
  }

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
      perfilId: datos.perfilId,
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
