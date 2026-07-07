const express = require('express');
const { getDb } = require('../db');

function crearRouterCRUD(nombreColeccion) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const items = await getDb().collection(nombreColeccion).find({}).toArray();
    res.json(items);
  });

  router.get('/:id', async (req, res) => {
    const item = await getDb().collection(nombreColeccion).findOne({ id: Number(req.params.id) });
    if (!item) return res.status(404).json(null);
    res.json(item);
  });

  router.post('/', async (req, res) => {
    const item = req.body;
    await getDb().collection(nombreColeccion).insertOne(item);
    res.status(201).json(item);
  });

  router.patch('/:id', async (req, res) => {
    const filtro = { id: Number(req.params.id) };
    await getDb().collection(nombreColeccion).updateOne(filtro, { $set: req.body });
    const actualizado = await getDb().collection(nombreColeccion).findOne(filtro);
    if (!actualizado) return res.status(404).json(null);
    res.json(actualizado);
  });

  return router;
}

module.exports = { crearRouterCRUD };
