const express = require('express');
const bcrypt = require('bcrypt');
const { getDb } = require('../db');

const router = express.Router();
const SALT_ROUNDS = 10;
const MAX_INTENTOS = 3;
const BLOQUEO_MINUTOS = 15;
const CODIGO_MINUTOS = 10;

async function resolverPerfil(db, usuario) {
  const coleccionPerfiles = db.collection('perfiles');

  if (usuario.perfilId) {
    try {
      const perfilOid = await coleccionPerfiles.findOne({ _id: usuario.perfilId });
      if (perfilOid) return perfilOid;
    } catch (e) {}
    
    const perfilIdNum = Number(usuario.perfilId);
    if (Number.isFinite(perfilIdNum)) {
      const perfilNum = await coleccionPerfiles.findOne({ id: perfilIdNum });
      if (perfilNum) return perfilNum;
    }
  }

  if (typeof usuario.perfil === 'string' && usuario.perfil.trim()) {
    return coleccionPerfiles.findOne({ nombre: usuario.perfil.trim() });
  }

  return null;
}

function generarCodigoSeisDigitos() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function bloqueadoHastaCaduca(valor) {
  return valor && new Date(valor).getTime() > Date.now();
}

async function limpiarIntentos(db, usuarioId) {
  await db.collection('usuarios').updateOne(
    { id: usuarioId },
    {
      $set: { intentosFallidos: 0 },
      $unset: { bloqueadoHasta: '', codigoRecuperacion: '', codigoRecuperacionExpira: '' },
    }
  );
}

async function registrarIntentoFallido(db, usuario) {
  const intentos = Number(usuario.intentosFallidos || 0) + 1;
  const update = { intentosFallidos: intentos };

  if (intentos >= MAX_INTENTOS) {
    update.intentosFallidos = 0;
    update.bloqueadoHasta = new Date(Date.now() + BLOQUEO_MINUTOS * 60 * 1000).toISOString();
  }

  await db.collection('usuarios').updateOne({ id: usuario.id }, { $set: update });
  return update;
}

router.get('/', async (req, res) => {
  const items = await getDb().collection('usuarios').find({}, { projection: { password: 0 } }).toArray();
  res.json(items);
});

const { ObjectId } = require('mongodb');

router.post('/', async (req, res) => {
  const { password, perfilId, ...resto } = req.body;
  let perfilOid;
  let perfilNum;
  
  if (ObjectId.isValid(perfilId)) {
    perfilOid = new ObjectId(perfilId);
  } else {
    perfilNum = Number(perfilId);
  }

  if (!perfilOid && !Number.isFinite(perfilNum)) {
    return res.status(400).json({ exito: false, mensaje: 'Debe seleccionar un perfil válido' });
  }

  const coleccionPerfiles = getDb().collection('perfiles');
  let perfil = null;
  
  if (perfilOid) {
    perfil = await coleccionPerfiles.findOne({ _id: perfilOid });
  }
  if (!perfil && perfilNum) {
    perfil = await coleccionPerfiles.findOne({ id: perfilNum });
  }

  if (!perfil) {
    return res.status(404).json({ exito: false, mensaje: 'El perfil seleccionado no existe' });
  }

  const idASalvar = perfilOid || perfilNum;
  const usuario = { ...resto, perfilId: idASalvar, password: await bcrypt.hash(password, SALT_ROUNDS) };
  await getDb().collection('usuarios').insertOne(usuario);
  const { password: _omitida, ...usuarioSinPassword } = usuario;
  res.status(201).json(usuarioSinPassword);
});

router.patch('/:id', async (req, res) => {
  const db = getDb();
  let { password, perfilId, ...resto } = req.body;
  
  const idStr = req.params.id;
  let queryId;
  if (ObjectId.isValid(idStr)) {
    queryId = new ObjectId(idStr);
  } else {
    queryId = Number(idStr);
  }

  const usuarioActual = await db.collection('usuarios').findOne({ _id: queryId }) || await db.collection('usuarios').findOne({ id: queryId });
  if (!usuarioActual) {
    return res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado' });
  }

  let updateData = { ...resto };
  if (password && password.trim() !== '') {
    updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
  }

  if (perfilId) {
    if (ObjectId.isValid(perfilId)) {
      updateData.perfilId = new ObjectId(perfilId);
    } else {
      updateData.perfilId = Number(perfilId);
    }
  }

  await db.collection('usuarios').updateOne({ _id: usuarioActual._id }, { $set: updateData });
  res.json({ exito: true, mensaje: 'Usuario actualizado correctamente' });
});

router.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  const db = getDb();
  const usuario = await db.collection('usuarios').findOne({
    $or: [{ correo: correo }, { username: correo }]
  });
  if (!usuario) {
    return res.json({ exito: false, mensaje: 'Credenciales inválidas' });
  }

  if (bloqueadoHastaCaduca(usuario.bloqueadoHasta)) {
    return res.json({ exito: false, mensaje: 'La cuenta está bloqueada temporalmente por intentos fallidos. Intente más tarde.' });
  }

  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) {
    const actualizacion = await registrarIntentoFallido(db, usuario);
    if (actualizacion.bloqueadoHasta) {
      return res.json({ exito: false, mensaje: 'Cuenta bloqueada por tres intentos fallidos consecutivos. Intente de nuevo más tarde.' });
    }
    return res.json({ exito: false, mensaje: 'Credenciales inválidas' });
  }

  await limpiarIntentos(db, usuario.id);

  const perfil = await resolverPerfil(db, usuario);
  res.json({
    exito: true,
    usuario: {
      id: usuario.id || usuario._id,
      correo: usuario.correo,
      perfilId: perfil?.id || perfil?._id || usuario.perfilId || null,
    },
    perfil: perfil
      ? {
          id: perfil.id || perfil._id,
          nombre: perfil.nombre,
          descripcion: perfil.descripcion,
          estado: perfil.estado,
          permisos: Array.isArray(perfil.permisos) ? perfil.permisos : [],
        }
      : null,
  });
});

router.post('/recovery/request', async (req, res) => {
  const { correo } = req.body;
  const db = getDb();
  const usuario = await db.collection('usuarios').findOne({ correo });

  if (!usuario) {
    return res.status(404).json({ exito: false, mensaje: 'No existe una cuenta con ese correo' });
  }

  const codigo = generarCodigoSeisDigitos();
  const codigoRecuperacionExpira = new Date(Date.now() + CODIGO_MINUTOS * 60 * 1000).toISOString();

  await db.collection('usuarios').updateOne(
    { id: usuario.id },
    {
      $set: {
        codigoRecuperacion: codigo,
        codigoRecuperacionExpira,
      },
    }
  );

  res.json({
    exito: true,
    mensaje: 'Código de verificación generado correctamente',
    codigo,
    expiracionMinutos: CODIGO_MINUTOS,
  });
});

router.post('/recovery/verify', async (req, res) => {
  const { correo, codigo } = req.body;
  const db = getDb();
  const usuario = await db.collection('usuarios').findOne({ correo });

  if (!usuario || !usuario.codigoRecuperacion || !bloqueadoHastaCaduca(usuario.codigoRecuperacionExpira)) {
    return res.status(400).json({ exito: false, mensaje: 'El código ya expiró o la solicitud no existe' });
  }

  if (String(usuario.codigoRecuperacion) !== String(codigo).trim()) {
    return res.status(400).json({ exito: false, mensaje: 'El código ingresado no es válido' });
  }

  res.json({ exito: true, mensaje: 'Código verificado correctamente' });
});

router.post('/recovery/change', async (req, res) => {
  const { correo, codigo, nuevaContrasena } = req.body;
  const db = getDb();
  const usuario = await db.collection('usuarios').findOne({ correo });

  if (!usuario || !usuario.codigoRecuperacion || !bloqueadoHastaCaduca(usuario.codigoRecuperacionExpira)) {
    return res.status(400).json({ exito: false, mensaje: 'El código ya expiró o la solicitud no existe' });
  }

  if (String(usuario.codigoRecuperacion) !== String(codigo).trim()) {
    return res.status(400).json({ exito: false, mensaje: 'El código ingresado no es válido' });
  }

  await db.collection('usuarios').updateOne(
    { id: usuario.id },
    {
      $set: {
        password: await bcrypt.hash(nuevaContrasena, SALT_ROUNDS),
        intentosFallidos: 0,
      },
      $unset: {
        codigoRecuperacion: '',
        codigoRecuperacionExpira: '',
        bloqueadoHasta: '',
      },
    }
  );

  res.json({ exito: true, mensaje: 'Contraseña actualizada correctamente' });
});

module.exports = router;
