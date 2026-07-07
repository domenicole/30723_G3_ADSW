const express = require('express');
const bcrypt = require('bcrypt');
const { getDb } = require('../db');

const router = express.Router();
const SALT_ROUNDS = 10;

router.get('/', async (req, res) => {
  const items = await getDb().collection('usuarios').find({}, { projection: { password: 0 } }).toArray();
  res.json(items);
});

router.post('/', async (req, res) => {
  const { password, ...resto } = req.body;
  const usuario = { ...resto, password: await bcrypt.hash(password, SALT_ROUNDS) };
  await getDb().collection('usuarios').insertOne(usuario);
  const { password: _omitida, ...usuarioSinPassword } = usuario;
  res.status(201).json(usuarioSinPassword);
});

router.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  const usuario = await getDb().collection('usuarios').findOne({ correo });
  if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
    return res.json({ exito: false, mensaje: 'Credenciales inválidas' });
  }
  res.json({
    exito: true,
    usuario: { correo: usuario.correo },
    perfil: { nombre: usuario.perfil },
  });
});

module.exports = router;
