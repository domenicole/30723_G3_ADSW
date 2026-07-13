const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

function normalizarTexto(valor) {
	return typeof valor === 'string' ? valor.trim() : '';
}

function normalizarPermisos(permisos) {
	if (!Array.isArray(permisos)) return [];
	return permisos.map((permiso) => normalizarTexto(permiso)).filter(Boolean);
}

function esAdministrador(perfil) {
	return normalizarTexto(perfil?.nombre).toLowerCase() === 'administrador';
}

function escaparExpresionRegular(valor) {
	return valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function validarPerfilUnico(db, nombre, idExcluir = null) {
	const perfilExistente = await db.collection('perfiles').findOne({
		nombre: { $regex: `^${escaparExpresionRegular(nombre)}$`, $options: 'i' },
	});

	if (!perfilExistente) return false;
	if (idExcluir === null) return true;
	return Number(perfilExistente.id) !== Number(idExcluir);
}

async function obtenerPerfilPorId(db, id) {
	return db.collection('perfiles').findOne({ id: Number(id) });
}

function construirResultadoPerfil(perfil) {
	return {
		id: perfil.id,
		nombre: perfil.nombre,
		descripcion: perfil.descripcion,
		estado: perfil.estado,
		permisos: Array.isArray(perfil.permisos) ? perfil.permisos : [],
	};
}

router.get('/', async (req, res) => {
	const perfiles = await getDb().collection('perfiles').find({}).sort({ nombre: 1 }).toArray();
	res.json(perfiles);
});

router.get('/:id', async (req, res) => {
	const perfil = await obtenerPerfilPorId(getDb(), req.params.id);
	if (!perfil) return res.status(404).json(null);
	res.json(perfil);
});

router.post('/', async (req, res) => {
	const db = getDb();
	const nombre = normalizarTexto(req.body?.nombre);
	const descripcion = normalizarTexto(req.body?.descripcion);
	const estado = normalizarTexto(req.body?.estado) || 'Activo';
	const permisos = normalizarPermisos(req.body?.permisos);

	if (!nombre) {
		return res.status(400).json({ exito: false, mensaje: 'El nombre del perfil es obligatorio' });
	}
	if (!descripcion) {
		return res.status(400).json({ exito: false, mensaje: 'La descripción del perfil es obligatoria' });
	}
	if (permisos.length === 0) {
		return res.status(400).json({ exito: false, mensaje: 'Debe seleccionar al menos un permiso' });
	}
	if (await validarPerfilUnico(db, nombre)) {
		return res.status(409).json({ exito: false, mensaje: 'Ya existe un perfil con ese nombre' });
	}

	const perfil = {
		id: Date.now(),
		nombre,
		descripcion,
		estado,
		permisos,
	};

	await db.collection('perfiles').insertOne(perfil);
	res.status(201).json({ exito: true, mensaje: 'Perfil registrado', perfil: construirResultadoPerfil(perfil) });
});

router.patch('/:id', async (req, res) => {
	const db = getDb();
	const id = Number(req.params.id);
	const perfilActual = await obtenerPerfilPorId(db, id);

	if (!perfilActual) {
		return res.status(404).json({ exito: false, mensaje: 'Perfil no encontrado' });
	}

	const nombre = normalizarTexto(req.body?.nombre) || perfilActual.nombre;
	const descripcion = normalizarTexto(req.body?.descripcion) || perfilActual.descripcion;
	const estado = normalizarTexto(req.body?.estado) || perfilActual.estado;
	const permisos = req.body?.permisos ? normalizarPermisos(req.body.permisos) : normalizarPermisos(perfilActual.permisos);

	if (!nombre) {
		return res.status(400).json({ exito: false, mensaje: 'El nombre del perfil es obligatorio' });
	}
	if (!descripcion) {
		return res.status(400).json({ exito: false, mensaje: 'La descripción del perfil es obligatoria' });
	}
	if (permisos.length === 0) {
		return res.status(400).json({ exito: false, mensaje: 'Debe seleccionar al menos un permiso' });
	}

	if (await validarPerfilUnico(db, nombre, id)) {
		return res.status(409).json({ exito: false, mensaje: 'Ya existe un perfil con ese nombre' });
	}

	if (estado === 'Inactivo' && esAdministrador(perfilActual)) {
		const administradoresActivos = await db.collection('perfiles').countDocuments({
			nombre: { $regex: /^administrador$/i },
			estado: 'Activo',
		});
		if (administradoresActivos <= 1) {
			return res.status(409).json({ exito: false, mensaje: 'No se puede desactivar el único perfil administrador activo' });
		}
	}

	const perfilActualizado = {
		...perfilActual,
		nombre,
		descripcion,
		estado,
		permisos,
	};

	await db.collection('perfiles').updateOne({ id }, { $set: perfilActualizado });
	res.json({ exito: true, mensaje: 'Perfil actualizado', perfil: construirResultadoPerfil(perfilActualizado) });
});

module.exports = router;
