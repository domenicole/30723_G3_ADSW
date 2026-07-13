export async function obtenerJSON(url) {
  const respuesta = await fetch(url);
  if (respuesta.status === 404) return null;
  return respuesta.json();
}

export async function enviarJSON(url, metodo, cuerpo) {
  const respuesta = await fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  });
  
  if (!respuesta.ok) {
    console.error(`Error HTTP ${respuesta.status} en ${url}`);
    try {
      return await respuesta.json();
    } catch {
      return { exito: false, mensaje: `Error de servidor: ${respuesta.status}` };
    }
  }
  return respuesta.json();
}
