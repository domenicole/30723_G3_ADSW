const { MongoClient } = require('mongodb');

let client;
let db;

async function conectarDB() {
  if (db) return db;
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db(process.env.MONGODB_DB || 'Ficitas');
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('La base de datos no está conectada. Llama a conectarDB() antes de usar getDb().');
  }
  return db;
}

module.exports = { conectarDB, getDb };
