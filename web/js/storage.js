// localStorage pode lancar (modo privado, cookies bloqueados): nunca derruba o app.
export function loadItem(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

export function saveItem(key, value) {
  try { localStorage.setItem(key, value); } catch (e) {}
}
