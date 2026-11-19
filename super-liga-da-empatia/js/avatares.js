// Avatares das crianças-heróis (14 imagens em assets/avatares). Cada pessoa escolhe o seu no celular ou é sorteada.
export const TOTAL_AVATARES = 14;
export const avSrc = (n) => `assets/avatares/av-${String(n).padStart(2, '0')}.png`;
const valido = (n) => Number.isInteger(n) && n >= 1 && n <= TOTAL_AVATARES;

/** Garante um avatar diferente para cada pessoa (ordem de entrada): quem não escolheu, ou repetiu, ganha o primeiro livre. */
export function resolverAvs(lista) {
  const usados = new Set();
  lista.forEach((j) => { if (valido(j.av) && !usados.has(j.av)) usados.add(j.av); else j.av = 0; });
  const livres = [];
  for (let n = 1; n <= TOTAL_AVATARES; n++) if (!usados.has(n)) livres.push(n);
  lista.forEach((j) => { if (!j.av) j.av = livres.length ? livres.shift() : 1; });
  return lista;
}
export const livresDe = (lista) => {
  const usados = new Set(lista.map((j) => j.av).filter(valido));
  return Array.from({ length: TOTAL_AVATARES }, (_, i) => i + 1).filter((n) => !usados.has(n));
};
export const fotoHtml = (n, cls = '') => `<span class="av foto ${cls}" style="background-image:url(${avSrc(n)})" aria-hidden="true"></span>`;
