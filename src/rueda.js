// Ruleta en SVG reutilizable (retos de dibujo y premios diarios).
import { esc } from './ui.js';

const polar = (r, grados) => {
  const rad = ((grados - 90) * Math.PI) / 180;
  return [100 + r * Math.cos(rad), 100 + r * Math.sin(rad)];
};

// Color de texto legible según el fondo.
const tintaPara = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const l = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return l > 0.62 ? '#2b3a6b' : '#fffdf6';
};

export function rueda(segmentos, { dona = true } = {}) {
  const paso = 360 / segmentos.length;
  const porciones = segmentos
    .map((s, i) => {
      const [x1, y1] = polar(96, i * paso);
      const [x2, y2] = polar(96, (i + 1) * paso);
      const medio = (i + 0.5) * paso;
      const [tx, ty] = polar(dona ? 70 : 62, medio);
      const tinta = tintaPara(s.color);
      const texto = s.icono
        ? `<text x="${tx}" y="${ty - 4}" font-size="13" text-anchor="middle">${s.icono}</text>
           <text x="${tx}" y="${ty + 9}" font-size="7.5" fill="${tinta}" text-anchor="middle" font-weight="700">${esc(s.etiqueta)}</text>`
        : `<text x="${tx}" y="${ty}" font-size="8" fill="${tinta}" text-anchor="middle" dominant-baseline="middle" font-weight="700"
             transform="rotate(${medio > 180 ? medio + 90 : medio - 90} ${tx} ${ty})">${esc(s.etiqueta)}</text>`;
      return `<path d="M100 100 L${x1} ${y1} A96 96 0 0 1 ${x2} ${y2} Z" fill="${s.color}" stroke="#fffdf6" stroke-width="1.5"/>${texto}`;
    })
    .join('');

  const el = document.createElement('div');
  el.className = 'rueda';
  el.innerHTML = `
    <svg class="rueda-giro" viewBox="0 0 200 200" role="img" aria-label="Ruleta">
      ${porciones}
      ${dona ? '<circle cx="100" cy="100" r="40" style="fill:var(--fondo)" stroke="#fffdf6" stroke-width="3"/>' : ''}
    </svg>
    <svg class="rueda-puntero" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 38 L6 8 Q20 0 34 8 Z" fill="#f0a39a" stroke="#2b3a6b" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
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
