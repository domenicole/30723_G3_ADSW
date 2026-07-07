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
  return respuesta.json();
}
