// Utilidades compartidas por todas las vistas.

export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// URLs de imágenes guardadas: cada pantalla tiene su lote y se libera al salir.
let urls = [];
export function urlDe(blob) {
  if (!blob) return '';
  const u = URL.createObjectURL(blob);
  urls.push(u);
  return u;
}
// Empieza un lote nuevo y devuelve la función que libera el anterior.
export function nuevoLote() {
  const viejas = urls;
  urls = [];
  return () => viejas.forEach((u) => URL.revokeObjectURL(u));
}

export function toast(texto) {
  const t = document.getElementById('toast');
  t.textContent = texto;
  t.classList.add('visible');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('visible'), 2600);
}

// Ventana modal sobre papel de cuaderno. Devuelve el elemento <dialog>.
export function modal(html, { clase = '', alCerrar } = {}) {
  const d = document.createElement('dialog');
  d.className = `modal papel ${clase}`;
  d.innerHTML = `<button class="cerrar" aria-label="Cerrar">✕</button>${html}`;
  document.body.append(d);
  const cerrar = () => d.close();
  d.querySelector('.cerrar').addEventListener('click', cerrar);
  d.addEventListener('click', (e) => e.target === d && cerrar());
  d.addEventListener('close', () => {
    alCerrar?.();
    d.remove();
  });
  d.showModal();
  return d;
}

export function confirmar(texto) {
  return new Promise((res) => {
    let ok = false;
    const d = modal(
      `<p class="confirmar-texto">${esc(texto)}</p>
       <div class="acciones"><button class="btn" data-no>Cancelar</button><button class="btn peligro" data-si>Sí, borrar</button></div>`,
      { clase: 'chico', alCerrar: () => res(ok) },
    );
    d.querySelector('[data-no]').onclick = () => d.close();
    d.querySelector('[data-si]').onclick = () => ((ok = true), d.close());
  });
}

// Reduce una imagen para miniaturas (las grillas cargan rápido en la tablet).
export async function miniatura(blob, lado = 640) {
  const bmp = await createImageBitmap(blob);
  const escala = Math.min(1, lado / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * escala);
  c.height = Math.round(bmp.height * escala);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  const tipo = blob.type === 'image/png' ? 'image/png' : 'image/jpeg';
  return new Promise((r) => c.toBlob(r, tipo, 0.85));
}

// Cambio de pantalla animado cuando el navegador lo permite.
export function transicion(fn) {
  if (document.startViewTransition && document.visibilityState === 'visible' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Si la animación se interrumpe o el navegador no la arranca a tiempo
    // (pestaña en segundo plano), el cambio de pantalla igual ocurre.
    let hecho = false;
    const correr = () => (hecho ? undefined : ((hecho = true), fn()));
    const t = document.startViewTransition(correr);
    t.ready.catch(() => {});
    t.finished.catch(() => {});
    const limite = new Promise((r) => setTimeout(r, 300));
    return Promise.race([t.updateCallbackDone.catch(() => {}), limite]).then(() => {
      if (!hecho) t.skipTransition();
      return correr();
    });
  }
  return Promise.resolve(fn());
}

// Visor con zoom: rueda del ratón, botones, arrastrar y pellizcar en tablet.
export function visor(src, titulo = '') {
  const d = modal(
    `<div class="visor-zona"><img class="visor-img" src="${src}" alt="${esc(titulo)}" draggable="false"></div>
     <div class="visor-controles">
       <button class="btn" data-z="-1" aria-label="Alejar">−</button>
       <button class="btn" data-z="0">Ajustar</button>
       <button class="btn" data-z="1" aria-label="Acercar">+</button>
     </div>`,
    { clase: 'visor' },
  );
  const zona = d.querySelector('.visor-zona');
  const img = d.querySelector('.visor-img');
  let s = 1, x = 0, y = 0;
  const pts = new Map();
  let ini = null;
  const aplicar = () => (img.style.transform = `translate(${x}px, ${y}px) scale(${s})`);
  const zoom = (f) => ((s = Math.min(8, Math.max(1, s * f))), s === 1 && (x = y = 0), aplicar());
  d.querySelectorAll('[data-z]').forEach((b) =>
    b.addEventListener('click', () => {
      const z = +b.dataset.z;
      if (z === 0) (s = 1), (x = y = 0), aplicar();
      else zoom(z > 0 ? 1.5 : 1 / 1.5);
    }),
  );
  zona.addEventListener('wheel', (e) => (e.preventDefault(), zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15)), { passive: false });
  zona.addEventListener('pointerdown', (e) => {
    zona.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    ini = { s, x, y, pts: new Map(pts) };
  });
  zona.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId) || !ini) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const [a, b] = [...pts.values()];
    const [a0, b0] = [...ini.pts.values()];
    if (b && b0) {
      const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
      s = Math.min(8, Math.max(1, ini.s * (dist(a, b) / dist(a0, b0))));
    } else if (s > 1) {
      x = ini.x + (a.x - a0.x);
      y = ini.y + (a.y - a0.y);
    }
    aplicar();
  });
  const soltar = (e) => {
    pts.delete(e.pointerId);
    ini = { s, x, y, pts: new Map(pts) };
  };
  zona.addEventListener('pointerup', soltar);
  zona.addEventListener('pointercancel', soltar);
  return d;
}

// Fechas en hora local con formato YYYY-MM-DD.
export const fechaISO = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const deISO = (s) => {
  const [a, m, d] = s.split('-').map(Number);
  return new Date(a, m - 1, d);
};

export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export const fechaBonita = (iso) => {
  if (!iso) return '';
  const d = deISO(iso);
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
};

// Lunes de la semana de una fecha.
export function inicioSemana(d = new Date()) {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  return r;
}

// Lluvia de confeti para celebrar (premio, meta cumplida, obra nueva).
export function celebrar(cantidad = 36) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const piezas = ['✦', '★', '❀', '♥', '✿', '●'];
  const colores = ['var(--acento)', 'var(--acento-2)', 'var(--acento-3)', '#f0a39a', '#a9c1e3'];
  for (let i = 0; i < cantidad; i++) {
    const p = document.createElement('span');
    p.className = 'confeti';
    p.textContent = piezas[i % piezas.length];
    p.style.left = `${Math.random() * 100}vw`;
    p.style.color = colores[i % colores.length];
    p.style.fontSize = `${0.8 + Math.random() * 1.1}rem`;
    p.style.setProperty('--giro', `${(Math.random() - 0.5) * 900}deg`);
    p.style.animationDuration = `${1.8 + Math.random() * 1.8}s`;
    p.style.animationDelay = `${Math.random() * 0.4}s`;
    p.addEventListener('animationend', () => p.remove());
    document.body.append(p);
  }
}

// Marca los hijos de un contenedor para que aparezcan uno tras otro.
export function escalonar(contenedor) {
  contenedor.classList.add('entrar');
  [...contenedor.children].forEach((h, i) => h.style.setProperty('--i', i));
}
