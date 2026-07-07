# FiCitas Web

Esta versión reemplaza la interfaz de escritorio por una aplicación web sencilla, moderna y funcional. Los datos (usuarios, pacientes, citas y perfiles) se guardan en una base de datos MongoDB Atlas a través de un pequeño backend Express incluido en `server/`.

## Cómo usarla

1. Instala las dependencias:

```bash
npm install
```

2. Configura la conexión a MongoDB copiando `.env.example` a `.env` (ya viene un `.env` con el connection string del proyecto; ajústalo si usas tu propio cluster).

3. La primera vez, crea los usuarios de prueba en la colección `usuarios`:

```bash
npm run seed
```

4. Levanta el servidor (sirve tanto la API como el frontend):

```bash
npm start
```

Luego entra a http://localhost:3000/

## Credenciales de prueba

- Administrador: admin@ficitas.com / 12345
- Auxiliar: auxiliar@ficitas.com / 12345

Estos usuarios se crean con `npm run seed` (contraseña guardada con hash bcrypt). Pacientes, citas y perfiles se leen y guardan directamente en MongoDB Atlas; ya no se usa `localStorage`.
