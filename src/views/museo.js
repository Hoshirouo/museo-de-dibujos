// Pantalla principal: el museo como edificio. Cada ventana lleva a una zona.
import { todos } from '../db.js';
import { esc, urlDe, fechaISO, inicioSemana } from '../ui.js';
import { retoDelDia } from '../data/calendario.js';
import { diasDibujados } from './metas.js';

// Letrero colgante bajo una ventana.
const letrero = (x, y, ancho, texto) => `
  <g class="letrero">
    <line x1="${x + 14}" y1="${y - 8}" x2="${x + 14}" y2="${y}" stroke="#6e4a33" stroke-width="2"/>
    <line x1="${x + ancho - 14}" y1="${y - 8}" x2="${x + ancho - 14}" y2="${y}" stroke="#6e4a33" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="${ancho}" height="28" rx="8" fill="#fffdf6" stroke="#2b3a6b" stroke-width="2"/>
    <text x="${x + ancho / 2}" y="${y + 20}" text-anchor="middle" font-size="19" fill="#2b3a6b">${texto}</text>
  </g>`;

// Mini cuadros con las obras más recientes, dentro de la ventana de la galería.
function cuadritos(obras) {
  const pos = [[140, 410], [262, 402], [384, 410]];
  return pos
    .map(([x, y], i) => {
      const o = obras[i];
      const w = i === 1 ? 76 : 70, h = i === 1 ? 92 : 80;
      const relleno = o
        ? `<image href="${urlDe(o.mini || o.imagen)}" x="${x + 7}" y="${y + 7}" width="${w - 14}" height="${h - 14}" preserveAspectRatio="xMidYMid slice"/>`
        : `<rect x="${x + 7}" y="${y + 7}" width="${w - 14}" height="${h - 14}" fill="${['#a9c1e3', '#f0a39a', '#b1c294'][i]}"/>
           <circle cx="${x + w / 2}" cy="${y + h / 2 - 6}" r="8" fill="#fffdf6" opacity=".8"/>
           <path d="M${x + 10} ${y + h - 10} l${w / 3} -${h / 4} l${w / 4} ${h / 8} l${w / 4} -${h / 6} V${y + h - 10}Z" fill="#fffdf6" opacity=".7"/>`;
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#c9a14a" stroke="#8a6322" stroke-width="3"/>${relleno}`;
    })
    .join('');
}

function edificio(obras) {
  return `
<svg class="edificio" viewBox="0 0 600 800" role="group" aria-label="Edificio del museo">
  <!-- nubes y estrellas -->
  <g fill="#fffdf6" opacity=".75">
    <ellipse cx="70" cy="60" rx="46" ry="16"/><ellipse cx="100" cy="48" rx="30" ry="16"/>
    <ellipse cx="540" cy="120" rx="40" ry="14"/><ellipse cx="560" cy="108" rx="24" ry="13"/>
  </g>
  <path d="M30 140 l6 12 13 2 -10 9 3 13 -12 -7 -12 7 3 -13 -10 -9 13 -2z" fill="#f7d98b"/>
  <path d="M565 30 l5 10 11 2 -8 7 2 11 -10 -6 -10 6 2 -11 -8 -7 11 -2z" fill="#f7d98b"/>

  <!-- chimenea y tejado -->
  <rect x="430" y="28" width="34" height="62" fill="#a85640"/><rect x="424" y="22" width="46" height="12" fill="#8c4533"/>
  <polygon points="36,180 104,66 496,66 564,180" fill="#c8644a"/>
  <g stroke="#a85640" stroke-width="3" opacity=".7">
    <line x1="80" y1="105" x2="520" y2="105"/><line x1="58" y1="142" x2="542" y2="142"/>
  </g>
  <rect x="28" y="176" width="544" height="14" rx="4" fill="#8c4533"/>

  <!-- buhardilla: biblioteca de bocetos -->
  <a href="#/bocetos" class="zona" aria-label="Biblioteca de bocetos">
    <path class="marco-ventana" d="M240 168 V112 a60 50 0 0 1 120 0 V168 Z" fill="#fffdf6" stroke="#2b3a6b" stroke-width="3"/>
    <path class="vidrio" d="M250 166 V114 a50 40 0 0 1 100 0 V166 Z" fill="#fbe3a0"/>
    <g>
      <rect x="258" y="128" width="84" height="5" fill="#8a6a52"/><rect x="258" y="160" width="84" height="5" fill="#8a6a52"/>
      <rect x="262" y="138" width="9" height="22" fill="#5f7f5b"/><rect x="272" y="141" width="8" height="19" fill="#f0a39a"/>
      <rect x="281" y="136" width="10" height="24" fill="#365680"/><rect x="292" y="142" width="8" height="18" fill="#f7d98b"/>
      <rect x="306" y="139" width="9" height="21" fill="#b1c294"/><rect x="316" y="137" width="10" height="23" fill="#a9c1e3"/>
      <rect x="327" y="143" width="9" height="17" fill="#e9c6ae"/>
      <rect x="276" y="112" width="8" height="16" fill="#2f8a6f"/><rect x="285" y="114" width="8" height="14" fill="#c8644a"/>
    </g>
    <line x1="300" y1="64" x2="300" y2="168" stroke="#fffdf6" stroke-width="3" opacity=".6"/>
  </a>

  <!-- fachada -->
  <rect x="60" y="190" width="480" height="572" fill="#f6e9d0"/>
  <rect x="60" y="190" width="18" height="572" fill="#ead7b6"/><rect x="522" y="190" width="18" height="572" fill="#ead7b6"/>
  <rect x="60" y="358" width="480" height="12" fill="#e9c6ae"/><rect x="60" y="560" width="480" height="12" fill="#e9c6ae"/>

  <!-- piso 2: calendario -->
  <a href="#/calendario" class="zona" aria-label="Calendario diario">
    <rect class="marco-ventana" x="96" y="206" width="170" height="120" rx="6" fill="#fffdf6" stroke="#2b3a6b" stroke-width="3"/>
    <rect class="vidrio" x="106" y="216" width="150" height="100" fill="#fbe3a0"/>
    <rect x="128" y="226" width="106" height="80" rx="4" fill="#fffdf6" stroke="#2b3a6b" stroke-width="2"/>
    <rect x="128" y="226" width="106" height="16" rx="4" fill="#f0a39a"/>
    <g fill="#d4dec6">${Array.from({ length: 12 }, (_, i) => `<rect x="${134 + (i % 4) * 25}" y="${248 + Math.floor(i / 4) * 18}" width="20" height="14" rx="2"/>`).join('')}</g>
    <rect x="159" y="266" width="20" height="14" rx="2" fill="#7fa37a"/>
    ${letrero(111, 334, 140, 'Calendario')}
  </a>

  <!-- piso 2: teoría del color -->
  <a href="#/galeria/Teor%C3%ADa%20del%20color" class="zona" aria-label="Sala de teoría del color">
    <rect class="marco-ventana" x="334" y="206" width="170" height="120" rx="6" fill="#fffdf6" stroke="#2b3a6b" stroke-width="3"/>
    <rect class="vidrio" x="344" y="216" width="150" height="100" fill="#fbe3a0"/>
    <path d="M375 300 c-30 -6 -34 -60 8 -70 c40 -10 78 14 70 44 c-4 16 -22 10 -26 22 c-4 12 -24 10 -52 4z" fill="#fffdf6" stroke="#8a6a52" stroke-width="2"/>
    <circle cx="390" cy="252" r="8" fill="#d9534f"/><circle cx="414" cy="244" r="8" fill="#f7d98b"/>
    <circle cx="436" cy="256" r="8" fill="#4f7caf"/><circle cx="380" cy="276" r="8" fill="#5dae6b"/>
    <circle cx="404" cy="285" r="7" fill="#9b7ec8"/>
    ${letrero(349, 334, 140, 'Teoría del color')}
  </a>

  <!-- piso 1: galería -->
  <a href="#/galeria" class="zona" aria-label="Galería de obras terminadas">
    <rect class="marco-ventana" x="96" y="384" width="408" height="136" rx="6" fill="#fffdf6" stroke="#2b3a6b" stroke-width="3"/>
    <rect class="vidrio" x="106" y="394" width="388" height="116" fill="#fbe3a0"/>
    <rect x="106" y="394" width="388" height="80" fill="#8fb4b5" opacity=".55"/>
    ${cuadritos(obras)}
    <rect x="106" y="496" width="388" height="14" fill="#8a6a52"/>
    ${letrero(225, 528, 150, 'Galería')}
  </a>
  <g fill="#7fa37a">
    <circle cx="86" cy="548" r="10"/><circle cx="98" cy="540" r="9"/><circle cx="512" cy="548" r="10"/><circle cx="502" cy="540" r="9"/>
  </g>

  <!-- planta baja: ruleta -->
  <path d="M84 592 h150 l-10 26 h-130z" fill="#f0a39a"/>
  <g fill="#fffdf6">${[0, 1, 2, 3, 4].map((i) => `<path d="M${98 + i * 28} 592 h14 l-2 26 h-12z"/>`).join('')}</g>
  <a href="#/ruleta" class="zona" aria-label="¿Qué dibujo hoy? Ruleta de retos">
    <rect class="marco-ventana" x="94" y="620" width="130" height="100" rx="4" fill="#fffdf6" stroke="#2b3a6b" stroke-width="3"/>
    <rect class="vidrio" x="102" y="628" width="114" height="84" fill="#fbe3a0"/>
    <g transform="translate(159 670)">
      ${['#5f7f5b', '#b1c294', '#2f8a6f', '#14707a', '#365680', '#9cb59a'].map((c, i) => `<path d="M0 0 L${(30 * Math.cos((i * Math.PI) / 3)).toFixed(1)} ${(30 * Math.sin((i * Math.PI) / 3)).toFixed(1)} A30 30 0 0 1 ${(30 * Math.cos(((i + 1) * Math.PI) / 3)).toFixed(1)} ${(30 * Math.sin(((i + 1) * Math.PI) / 3)).toFixed(1)}Z" fill="${c}"/>`).join('')}
      <circle r="10" fill="#d4dec6"/><path d="M0 -40 l-6 -10 h12z" fill="#f0a39a" stroke="#2b3a6b" stroke-width="1.5"/>
    </g>
    ${letrero(84, 728, 150, '¿Qué dibujo hoy?')}
  </a>

  <!-- puerta -->
  <a href="#/galeria" class="zona" aria-label="Entrada al museo">
    <path class="marco-ventana" d="M248 762 V640 a52 52 0 0 1 104 0 V762z" fill="#5f7f5b" stroke="#2b3a6b" stroke-width="3"/>
    <path class="vidrio" d="M266 700 V646 a34 34 0 0 1 68 0 V700z" fill="#fbe3a0"/>
    <circle cx="336" cy="722" r="5" fill="#f7d98b"/>
    <rect x="252" y="586" width="96" height="26" rx="6" fill="#2b3a6b"/>
    <text x="300" y="605" text-anchor="middle" font-size="18" fill="#fffdf6" font-family="Gaegu, cursive" font-weight="700">MUSEO</text>
  </a>

  <!-- planta baja: metas -->
  <a href="#/metas" class="zona" aria-label="Pizarra de metas de la semana">
    <rect class="marco-ventana" x="376" y="616" width="134" height="104" rx="4" fill="#a0714f" stroke="#2b3a6b" stroke-width="3"/>
    <rect class="vidrio" x="384" y="624" width="118" height="88" fill="#d8b48a"/>
    <rect x="394" y="632" width="44" height="36" fill="#fffdf6" transform="rotate(-4 416 650)"/>
    <rect x="446" y="636" width="44" height="36" fill="#f7d98b" transform="rotate(3 468 654)"/>
    <rect x="410" y="672" width="48" height="34" fill="#a9c1e3" transform="rotate(2 434 689)"/>
    <g stroke="#2b3a6b" stroke-width="2" stroke-linecap="round">
      <path d="M400 645 l4 4 8 -9" fill="none"/><line x1="416" y1="646" x2="432" y2="644"/>
      <line x1="452" y1="648" x2="482" y2="650"/><line x1="452" y1="658" x2="474" y2="659"/>
      <line x1="418" y1="686" x2="448" y2="687"/>
    </g>
    <circle cx="416" cy="634" r="3" fill="#d9534f"/><circle cx="468" cy="638" r="3" fill="#d9534f"/>
    ${letrero(368, 728, 150, 'Metas')}
  </a>

  <!-- vereda y macetas -->
  <rect x="20" y="762" width="560" height="22" rx="6" fill="#b9c7a8"/>
  <g><rect x="34" y="728" width="30" height="34" rx="4" fill="#c8644a"/><circle cx="49" cy="716" r="18" fill="#7fa37a"/><circle cx="40" cy="704" r="5" fill="#f0a39a"/><circle cx="56" cy="710" r="5" fill="#f7d98b"/></g>
  <g><rect x="536" y="728" width="30" height="34" rx="4" fill="#c8644a"/><circle cx="551" cy="716" r="18" fill="#5f7f5b"/><circle cx="545" cy="704" r="5" fill="#fffdf6"/></g>
</svg>`;
}

export default async function museo(el) {
  const [obras, eventos, diario] = await Promise.all([todos('obras'), todos('eventos'), todos('diario')]);
  obras.sort((a, b) => (b.creado || 0) - (a.creado || 0));
  const hoy = fechaISO();
  const reto = retoDelDia(hoy, eventos);
  const hecho = diario.some((d) => d.fecha === hoy);
  const dias = await diasDibujados(inicioSemana());

  el.innerHTML = `
    <div class="museo-escena">
      ${edificio(obras)}
      <aside class="museo-lateral">
        <section class="papel cinta tarjeta-hoy">
          <h2>Reto de hoy</h2>
          ${reto.tematico ? `<p class="ayuda">✨ ${esc(reto.tematico)}</p>` : ''}
          <div class="palabra-grande">${esc(reto.palabra)}</div>
          <p>${esc(reto.significado)}</p>
          <p class="muestra-color"><i style="background:${reto.color.hex}"></i>${esc(reto.color.nombre)} · ${reto.color.hex}</p>
          <a class="btn ${hecho ? '' : 'primario'}" href="#/calendario">${hecho ? '✓ Ya dibujaste hoy' : 'Subir dibujo de hoy'}</a>
        </section>
        <section class="papel">
          <h2>Esta semana</h2>
          <p><strong>${dias.size}</strong> de 7 días dibujando</p>
          <div class="cal-progreso"><i style="width:${(dias.size / 7) * 100}%"></i></div>
          <p class="ayuda" style="margin-top:12px">${obras.length} obras en la galería</p>
          <a class="btn" href="#/ruleta">🎡 ¿Qué dibujo hoy?</a>
        </section>
      </aside>
    </div>`;
}
