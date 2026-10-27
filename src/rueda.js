// Ruleta en SVG reutilizable (retos de dibujo y premios diarios).
import { esc } from './ui.js';

const polar = (r, grados) => {
  const rad = ((grados - 90) * Math.PI) / 180;
  return [100 + r * Math.cos(rad), 100 + r * Math.sin(rad)];
};

// Color del segmento i según el tema activo (variables --r1…--r10 en styles.css).
export const colorRueda = (i) => `var(--r${(i % 10) + 1})`;

export function rueda(segmentos, { dona = true } = {}) {
  const paso = 360 / segmentos.length;
  const porciones = segmentos
    .map((s, i) => {
      const [x1, y1] = polar(96, i * paso);
      const [x2, y2] = polar(96, (i + 1) * paso);
      const medio = (i + 0.5) * paso;
      const [tx, ty] = polar(dona ? 68 : 62, medio);
      // Las palabras largas se achican para no salirse del segmento.
      const tam = Math.min(8, 50 / (s.etiqueta.length * 0.55)).toFixed(2);
      const texto = s.icono
        ? `<text x="${tx}" y="${ty - 4}" font-size="13" text-anchor="middle">${s.icono}</text>
           <text class="rueda-texto" x="${tx}" y="${ty + 9}" font-size="7.5" text-anchor="middle">${esc(s.etiqueta)}</text>`
        : `<text class="rueda-texto" x="${tx}" y="${ty}" font-size="${tam}" text-anchor="middle" dominant-baseline="middle"
             transform="rotate(${medio > 180 ? medio + 90 : medio - 90} ${tx} ${ty})">${esc(s.etiqueta)}</text>`;
      return `<path d="M100 100 L${x1} ${y1} A96 96 0 0 1 ${x2} ${y2} Z" style="fill:${colorRueda(i)}" stroke="#fffdf6" stroke-width="1.5"/>${texto}`;
    })
    .join('');

  const el = document.createElement('div');
  el.className = 'rueda';
  el.innerHTML = `
    <svg class="rueda-giro" viewBox="0 0 200 200" role="img" aria-label="Ruleta">
      ${porciones}
      ${dona ? '<circle cx="100" cy="100" r="40" style="fill:var(--fondo)" stroke="#fffdf6" stroke-width="3"/>' : ''}
    </svg>
    <svg class="rueda-puntero" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 38 L6 8 Q20 0 34 8 Z" style="fill:var(--acento);stroke:var(--tinta)" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
  const giro = el.querySelector('.rueda-giro');
  let angulo = 0;

  return {
    el,
    // Gira y se detiene en el segmento `indice`. Resuelve al terminar.
    girar(indice) {
      const centro = (indice + 0.5) * paso + (Math.random() - 0.5) * paso * 0.6;
      const base = angulo - (angulo % 360);
      angulo = base + 360 * 5 + (360 - centro);
      const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
      giro.style.transition = reducido ? 'none' : 'transform 4s cubic-bezier(.17,.67,.12,1)';
      giro.style.transform = `rotate(${angulo}deg)`;
      return new Promise((r) => setTimeout(r, reducido ? 50 : 4100));
    },
  };
}
