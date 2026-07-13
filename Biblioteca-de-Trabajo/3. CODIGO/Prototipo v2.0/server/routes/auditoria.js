const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await getDb().collection('auditoria').find({}).sort({ fecha: -1 }).toArray();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const auditoria = req.body;
    await getDb().collection('auditoria').insertOne(auditoria);
    res.status(201).json({ exito: true, mensaje: 'Auditoría registrada', auditoria });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
});

module.exports = router;
