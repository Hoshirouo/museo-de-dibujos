// Inicio tipo perfil: portada, avatar y un tablero de widgets.
// El edificio del museo sigue aquí como un widget más.
import { todos, ajuste, guardarAjuste } from '../db.js';
import { esc, urlDe, fechaISO, inicioSemana, modal, toast, escalonar, miniatura, MESES } from '../ui.js';
import { retoDelDia } from '../data/calendario.js';
import { diasDibujados, resumenMetas } from './metas.js';
import { recargar } from '../main.js';

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
  <g class="nube" fill="#fffdf6" opacity=".75">
    <ellipse cx="70" cy="60" rx="46" ry="16"/><ellipse cx="100" cy="48" rx="30" ry="16"/>
    <ellipse cx="540" cy="120" rx="40" ry="14"/><ellipse cx="560" cy="108" rx="24" ry="13"/>
  </g>
  <path d="M30 140 l6 12 13 2 -10 9 3 13 -12 -7 -12 7 3 -13 -10 -9 13 -2z" fill="#f7d98b"/>
  <path d="M565 30 l5 10 11 2 -8 7 2 11 -10 -6 -10 6 2 -11 -8 -7 11 -2z" fill="#f7d98b"/>

  <!-- chimenea y tejado -->
  <rect x="430" y="28" width="34" height="62" fill="#a85640"/><rect x="424" y="22" width="46" height="12" fill="#8c4533"/>
  <circle class="humo" cx="447" cy="12" r="9" fill="#fffdf6"/><circle class="humo" cx="447" cy="12" r="7" fill="#fffdf6" style="animation-delay:-2s"/>
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

const PERFIL_INICIAL = {
  nombre: 'Mi museo',
  bio: 'Un rincón para mis dibujos, bocetos y retos ✿',
  avatarEmoji: '🎨',
  frase: 'Cada dibujo cuenta, incluso los que no salen como quería.',
  recordatorios: [
    { texto: 'Tomar agua', hecho: false },
    { texto: 'Estirar las manos antes de dibujar', hecho: false },
    { texto: 'Guardar una copia de mis dibujos', hecho: false },
  ],
  cancion: '',
};

export const perfil = async () => ({ ...PERFIL_INICIAL, ...(await ajuste('perfil', {})) });
const guardarPerfil = (p) => guardarAjuste('perfil', p);

const ESPACIO = [
  ['#/galeria', '🖼️', 'Galería'],
  ['#/bocetos', '📚', 'Cuadernos de bocetos'],
  ['#/calendario', '📅', 'Calendario diario'],
  ['#/ruleta', '🎡', '¿Qué dibujo hoy?'],
  ['#/metas', '📌', 'Metas de la semana'],
  ['#/galeria/Teor%C3%ADa%20del%20color', '🎨', 'Teoría del color'],
];

const DIAS_CORTOS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function miniCalendario(hoy, hechos) {
  const primero = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const total = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const celdas = Array((primero.getDay() + 6) % 7).fill('');
  for (let d = 1; d <= total; d++) celdas.push(d);
  while (celdas.length % 7) celdas.push('');
  const filas = [];
  for (let i = 0; i < celdas.length; i += 7) {
    filas.push(
      `<tr>${celdas
        .slice(i, i + 7)
        .map((d) => {
          if (!d) return '<td></td>';
          const iso = fechaISO(new Date(hoy.getFullYear(), hoy.getMonth(), d));
          const clases = [d === hoy.getDate() && 'hoy', hechos.has(iso) && 'hecho'].filter(Boolean).join(' ');
          return `<td><span class="${clases}">${d}</span></td>`;
        })
        .join('')}</tr>`,
    );
  }
  return `<div class="mini-cal-mes">${MESES[hoy.getMonth()]} ${hoy.getFullYear()}</div>
    <table class="mini-cal"><thead><tr>${DIAS_CORTOS.map((d) => `<th>${d}</th>`).join('')}</tr></thead><tbody>${filas.join('')}</tbody></table>`;
}

// Cuánto va del año, mes, semana y día (como en las plantillas de Notion).
function progresoTiempo(ahora) {
  const pct = (desde, hasta) => Math.round(((ahora - desde) / (hasta - desde)) * 100);
  const a = ahora.getFullYear(), m = ahora.getMonth();
  const lunes = inicioSemana(ahora);
  const finSemana = new Date(lunes);
  finSemana.setDate(finSemana.getDate() + 7);
  const dia = new Date(a, m, ahora.getDate());
  return [
    ['Año', pct(new Date(a, 0, 1), new Date(a + 1, 0, 1))],
    ['Mes', pct(new Date(a, m, 1), new Date(a, m + 1, 1))],
    ['Semana', pct(lunes, finSemana)],
    ['Día', pct(dia, new Date(a, m, ahora.getDate() + 1))],
  ];
}

const widget = (icono, titulo, cuerpo, clase = '') =>
  `<section class="widget ${clase}"><h2 class="widget-titulo"><span class="icono">${icono}</span>${titulo}</h2><div class="widget-cuerpo">${cuerpo}</div></section>`;

export default async function museo(el) {
  const [obras, eventos, diario, p, metas] = await Promise.all([todos('obras'), todos('eventos'), todos('diario'), perfil(), resumenMetas()]);
  obras.sort((a, b) => (b.creado || 0) - (a.creado || 0));
  const ahora = new Date();
  const hoy = fechaISO(ahora);
  const reto = retoDelDia(hoy, eventos);
  const hecho = diario.some((d) => d.fecha === hoy);
  const dias = await diasDibujados(inicioSemana());
  const hechosMes = new Set(diario.map((d) => d.fecha));
  const recientes = obras.slice(0, 4);

  const portada = p.portada ? `<img class="portada-img" src="${urlDe(p.portada)}" alt="">` : '';
  const decos = p.portada
    ? ''
    : ['✦', '☁', '★', '✿', '☁', '✦']
        .map((c, i) => `<span class="deco" style="left:${8 + i * 16}%;top:${18 + ((i * 37) % 55)}%;animation-delay:${-i * 1.1}s">${c}</span>`)
        .join('');

  const mosaico = [0, 1, 2, 3]
    .map((i) => {
      const o = recientes[i];
      return o
        ? `<a href="#/galeria" title="${esc(o.titulo)}"><img src="${urlDe(o.mini || o.imagen)}" alt="${esc(o.titulo)}" loading="lazy"></a>`
        : `<a href="#/galeria" aria-label="Colgar una obra"><span class="hueco">${['✿', '☁', '★', '♡'][i]}</span></a>`;
    })
    .join('');

  const barras = progresoTiempo(ahora)
    .concat([['Días dibujando', Math.round((dias.size / 7) * 100), `${dias.size}/7`]])
    .map(([n, v, etiqueta]) => `<div class="barra-prog"><span>${n}</span><span class="ayuda">${etiqueta || `${v}%`}</span><div class="pista"><i data-ancho="${v}"></i></div></div>`)
    .join('');

  const listaMetas = metas
    .map((m) => {
      const ok = m.progreso >= m.objetivo;
      return `<li class="${ok ? 'hecha' : ''}"><input type="checkbox" disabled ${ok ? 'checked' : ''} aria-label="${ok ? 'Cumplida' : 'Pendiente'}"><span>${esc(m.texto)}</span><span class="ayuda" style="margin-left:auto">${m.progreso}/${m.objetivo}</span></li>`;
    })
    .join('');

  const recordatorios = p.recordatorios
    .map((r, i) => `<li class="${r.hecho ? 'hecha' : ''}"><input type="checkbox" data-i="${i}" ${r.hecho ? 'checked' : ''} id="rec${i}"><label for="rec${i}"><span>${esc(r.texto)}</span></label><button class="quitar" data-quitar="${i}" aria-label="Quitar recordatorio">✕</button></li>`)
    .join('');

  const musica = p.musica
    ? `<div class="musica"><div class="fila"><div class="musica-disco" data-disco></div><div style="flex:1;min-width:0"><strong style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.cancion || 'Mi canción')}</strong><div class="ondas" data-ondas>${'<i></i>'.repeat(14)}</div></div></div><audio controls loop preload="metadata" src="${urlDe(p.musica)}"></audio></div>`
    : `<div class="musica"><div class="fila"><div class="musica-disco"></div><p class="ayuda" style="margin:0;flex:1">Sube tu canción favorita para dibujar en <strong>✎ Personalizar</strong>.</p></div></div>`;

  el.innerHTML = `
    <div class="portada">${portada}${decos}<button class="btn chico" data-acc="personalizar">✎ Personalizar</button></div>
    <div class="perfil-cabecera">
      <div class="avatar">${p.avatar ? `<img src="${urlDe(p.avatar)}" alt="Foto de perfil">` : `<span aria-hidden="true">${esc(p.avatarEmoji)}</span>`}</div>
      <div class="perfil-texto"><h1>${esc(p.nombre)}</h1><p>${esc(p.bio)}</p></div>
    </div>
    <div class="tablero">
      ${widget('🏠', 'Mi espacio', `<ul class="menu-espacio">${ESPACIO.map(([h, i, t]) => `<li><a href="${h}"><span aria-hidden="true">${i}</span>${t}</a></li>`).join('')}<li class="perlas" aria-hidden="true">${'○'.repeat(24)}</li></ul>`)}
      ${widget('✏️', 'Reto de hoy', `
        <div class="reto-mini">
          ${reto.tematico ? `<p class="ayuda" style="margin:0">✨ ${esc(reto.tematico)}</p>` : ''}
          <div class="palabra-grande">${esc(reto.palabra)}</div>
          <p style="margin:6px 0 10px">${esc(reto.significado)}</p>
          <p class="muestra-color" style="margin:0 0 14px"><i style="background:${reto.color.hex}"></i>${esc(reto.color.nombre)} · ${reto.color.hex}</p>
          <a class="btn chico ${hecho ? '' : 'primario'}" href="#/calendario">${hecho ? '✓ Ya dibujaste hoy' : 'Subir dibujo de hoy'}</a>
        </div>`)}
      ${widget('⏰', 'Ahora', `<div class="reloj"><div><b data-h></b><span>hora</span></div><div><b data-m></b><span>min</span></div></div><p class="reloj-fecha" data-fecha></p>`)}
      ${widget('🖼️', 'Últimas obras', `<div class="mosaico">${mosaico}</div>${obras.length ? '' : '<p class="ayuda" style="margin:10px 0 0">Aquí aparecerán tus obras más recientes.</p>'}`, 'ancho')}
      ${widget('📅', 'Calendario', miniCalendario(ahora, hechosMes))}
      ${widget('📈', 'Progreso', `<div class="barras">${barras}</div>`)}
      ${widget('📌', 'Metas de la semana', `<ul class="lista-check">${listaMetas}</ul><a class="btn chico" href="#/metas" style="margin-top:12px">Ver metas</a>`)}
      <blockquote class="frase" style="margin:0">${esc(p.frase)}</blockquote>
      ${widget('🌼', 'Recordatorios', `<ul class="lista-check" data-recordatorios>${recordatorios}</ul>
        <form class="nueva-nota" data-nueva><input name="texto" maxlength="80" placeholder="Nuevo recordatorio…" aria-label="Nuevo recordatorio" required><button class="btn chico">+</button></form>`)}
      ${widget('🎵', 'Ahora suena', musica)}
      ${widget('🏛️', 'Mi museo', edificio(obras), 'widget-edificio')}
    </div>`;

  escalonar(el.querySelector('.tablero'));

  // Reloj en vivo; se detiene solo al salir de la pantalla.
  const h = el.querySelector('[data-h]'), m = el.querySelector('[data-m]'), f = el.querySelector('[data-fecha]');
  const poner = (nodo, valor) => {
    if (nodo.textContent === valor) return;
    nodo.textContent = valor;
    nodo.classList.remove('cambio');
    void nodo.offsetWidth;
    nodo.classList.add('cambio');
  };
  let montado = false;
  const tic = () => {
    if (el.isConnected) montado = true;
    else if (montado) return clearInterval(intervalo);
    const d = new Date();
    poner(h, String(d.getHours()).padStart(2, '0'));
    poner(m, String(d.getMinutes()).padStart(2, '0'));
    f.textContent = d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
  };
  const intervalo = setInterval(tic, 1000);
  tic();

  // Las barras se llenan con animación al aparecer.
  setTimeout(() => el.querySelectorAll('[data-ancho]').forEach((i) => (i.style.width = `${i.dataset.ancho}%`)), 350);

  const audio = el.querySelector('audio');
  if (audio) {
    const disco = el.querySelector('[data-disco]'), ondas = el.querySelector('[data-ondas]');
    const estado = () => (disco.classList.toggle('sonando', !audio.paused), ondas.classList.toggle('activas', !audio.paused));
    audio.addEventListener('play', estado);
    audio.addEventListener('pause', estado);
  }

  // Recordatorios editables en el mismo tablero.
  const listaRec = el.querySelector('[data-recordatorios]');
  listaRec.addEventListener('change', async (e) => {
    const i = +e.target.dataset.i;
    p.recordatorios[i].hecho = e.target.checked;
    e.target.closest('li').classList.toggle('hecha', e.target.checked);
    await guardarPerfil(p);
  });
  listaRec.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-quitar]');
    if (!b) return;
    p.recordatorios.splice(+b.dataset.quitar, 1);
    await guardarPerfil(p);
    recargar();
  });
  el.querySelector('[data-nueva]').addEventListener('submit', async (e) => {
    e.preventDefault();
    p.recordatorios.push({ texto: e.target.texto.value.trim(), hecho: false });
    await guardarPerfil(p);
    recargar();
  });

  el.querySelector('[data-acc="personalizar"]').addEventListener('click', () => personalizar(p));
}

function personalizar(p) {
  const d = modal(`
    <h2>Personalizar mi espacio</h2>
    <form>
      <div class="campo"><label for="pn">Nombre o título</label><input id="pn" name="nombre" maxlength="40" required value="${esc(p.nombre)}"></div>
      <div class="campo"><label for="pb">Descripción</label><input id="pb" name="bio" maxlength="120" value="${esc(p.bio)}"></div>
      <div class="campo"><label for="pf">Frase favorita</label><textarea id="pf" name="frase" maxlength="300">${esc(p.frase)}</textarea></div>
      <div class="campo"><label for="pp">Imagen de portada</label><input id="pp" type="file" name="portada" accept="image/*">
        ${p.portada ? '<label class="ayuda"><input type="checkbox" name="quitarPortada"> Quitar la portada actual</label>' : ''}</div>
      <div class="fila">
        <div class="campo" style="flex:2"><label for="pa">Foto de perfil</label><input id="pa" type="file" name="avatar" accept="image/*"></div>
        <div class="campo" style="flex:1"><label for="pe">o un emoji</label><input id="pe" name="avatarEmoji" maxlength="4" value="${esc(p.avatarEmoji)}"></div>
      </div>
      ${p.avatar ? '<label class="ayuda" style="display:block;margin:-8px 0 14px"><input type="checkbox" name="quitarAvatar"> Quitar la foto y usar el emoji</label>' : ''}
      <div class="campo"><label for="pm">Canción (archivo de audio)</label><input id="pm" type="file" name="musica" accept="audio/*">
        ${p.musica ? '<label class="ayuda"><input type="checkbox" name="quitarMusica"> Quitar la canción</label>' : ''}</div>
      <div class="campo"><label for="pc">Nombre de la canción</label><input id="pc" name="cancion" maxlength="80" value="${esc(p.cancion)}" placeholder="Ej: Snow flower — V"></div>
      <div class="acciones"><button class="btn primario">Guardar</button></div>
    </form>`);
  d.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button.primario');
    btn.disabled = true;
    btn.textContent = 'Guardando…';
    const f = new FormData(e.target);
    const nuevo = {
      ...p,
      nombre: f.get('nombre').trim(),
      bio: f.get('bio').trim(),
      frase: f.get('frase').trim(),
      avatarEmoji: f.get('avatarEmoji').trim() || '🎨',
      cancion: f.get('cancion').trim(),
    };
    const archivo = (n) => (f.get(n) && f.get(n).size ? f.get(n) : null);
    if (archivo('portada')) nuevo.portada = await miniatura(archivo('portada'), 2000);
    else if (f.get('quitarPortada')) delete nuevo.portada;
    if (archivo('avatar')) nuevo.avatar = await miniatura(archivo('avatar'), 400);
    else if (f.get('quitarAvatar')) delete nuevo.avatar;
    if (archivo('musica')) {
      nuevo.musica = archivo('musica');
      if (!nuevo.cancion) nuevo.cancion = nuevo.musica.name.replace(/\.[^.]+$/, '');
    } else if (f.get('quitarMusica')) delete nuevo.musica;
    await guardarPerfil(nuevo);
    d.close();
    toast('¡Tu espacio quedó lindo! ✿');
    recargar();
  });
}
