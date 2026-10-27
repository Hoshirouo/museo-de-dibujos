// Personaje en pixel art, original, dibujado por capas en una cuadrícula de 16×24.
// Las opciones salen del documento de ideas: género 2, cabellos 4,
// ropa de arriba 2, de abajo 2 y zapatos 2, más colores.
// Cada capa es un mapa de letras; '.' es vacío. Mayúscula = color base,
// minúscula = sombra del mismo color.

const ANCHO = 16, ALTO = 24;

const CUERPO = [
  '................',
  '................',
  '.....SSSSSS.....',
  '....SSSSSSSS....',
  '...SSSSSSSSSS...',
  '...SSSSSSSSSS...',
  '...SSSSSSSSSS...',
  '...SSSSSSSSSS...',
  '...SSSSSSSSSS...',
  '...SSSSSSSSSs...',
  '...SSSSSSSSss...',
  '....sSSSSSSs....',
  '......SSSS......',
  '....SSssssSS....',
  '...SSSSSSSSSS...',
  '...SSSSSSSSSS...',
  '...SSSSSSSSSS...',
  '...SSSSSSSSSS...',
  '...S.SSSSSS.S...',
  '.....SSSSSS.....',
  '.....SS..SS.....',
  '.....SS..Ss.....',
  '.....Ss..Ss.....',
  '................',
];

// Ojos, boca, rubor y pestañas (solo en "chica").
const CARA = { 7: '.....wE..wE.....', 8: '.....EE..EE.....', 9: '....b......b....', 10: '.......mm.......' };
const CARA_PARPADEO = { 8: '.....ee..ee.....', 9: '....b......b....', 10: '.......mm.......' };
const PESTANAS = { 6: '....l......l....' };

export const CABELLOS = [
  {
    nombre: 'Corto',
    frente: {
      1: '.....HHHHHH.....', 2: '...HHHHHHHHHH...', 3: '..HHHHHHHHHHHH..', 4: '..HHHHHHHHHHHH..',
      5: '..HHH.HHHH.HHH..', 6: '..HH........HH..', 7: '..Hh........hH..', 8: '..h..........h..',
    },
  },
  {
    nombre: 'Largo',
    atras: {
      6: '..hhhhhhhhhhhh..', 7: '..hhhhhhhhhhhh..', 8: '..hhhhhhhhhhhh..', 9: '..hhhhhhhhhhhh..', 10: '..hhhhhhhhhhhh..',
      11: '..hhhhhhhhhhhh..', 12: '..hhhhhhhhhhhh..', 13: '..hhhhhhhhhhhh..', 14: '..hhhhhhhhhhhh..', 15: '...hhhhhhhhhh...',
    },
    frente: {
      1: '.....HHHHHH.....', 2: '...HHHHHHHHHH...', 3: '..HHHHHHHHHHHH..', 4: '..HHHHHHHHHHHH..',
      5: '..HHHHHH..HHHH..', 6: '..HHH......HHH..', 7: '..HH........HH..', 8: '..HH........HH..', 9: '..HH........HH..',
      10: '..HH........HH..', 11: '..HH........HH..', 12: '..Hh........hH..', 13: '..hh........hh..', 14: '..h..........h..',
    },
  },
  {
    nombre: 'Coletas',
    frente: {
      1: '.....HHHHHH.....', 2: '...HHHHHHHHHH...', 3: '..HHHHHHHHHHHH..', 4: '.THHHHHHHHHHHHT.',
      5: 'HHHHH.HHHH.HHHHH', 6: 'HH.H........H.HH', 7: 'HH............HH', 8: 'Hh............hH',
      9: 'hh............hh', 10: '.h............h.',
    },
  },
  {
    nombre: 'Moño',
    frente: {
      0: '......HHHH......', 1: '.....HhHHhH.....', 2: '....HHHHHHHH....', 3: '...HHHHHHHHHH...',
      4: '..HHHHHHHHHHHH..', 5: '..HHH.HH.HHHHH..', 6: '..HH........HH..', 7: '..h..........h..',
    },
  },
];

export const ARRIBA = [
  {
    nombre: 'Camiseta',
    mapa: { 13: '...CCCCCCCCCC...', 14: '...CCCCDDCCCC...', 15: '....CCCCCCCC....', 16: '....CCCCCCCc....', 17: '....CCCCCCcc....' },
  },
  {
    nombre: 'Suéter',
    mapa: { 13: '...CCCCDDCCCC...', 14: '...CCCCCCCCCC...', 15: '...CCCCCCCCCc...', 16: '...CCCCCCCCCc...', 17: '...DCCCCCCCcD...' },
  },
];

export const ABAJO = [
  { nombre: 'Pantalón', mapa: { 18: '....PPPPPPPP....', 19: '.....PPPPPPp....', 20: '.....PP..Pp.....', 21: '.....Pp..pp.....' } },
  { nombre: 'Falda', mapa: { 18: '....PPPPPPPP....', 19: '...PPPPPPPPPP...', 20: '...PPPPPPPPpp...' } },
];

export const ZAPATOS = [
  { nombre: 'Botas', mapa: { 21: '.....ZZ..ZZ.....', 22: '.....ZZ..Zz.....', 23: '....ZZZ..Zzz....' } },
  { nombre: 'Zapatillas', mapa: { 22: '.....ZZ..Zz.....', 23: '....DDD..DDD....' } },
];

export const GENEROS = ['Chica', 'Chico'];

export const COLORES = {
  piel: ['#fde0c8', '#f3c39b', '#d99a6c', '#a86b45', '#6e4429'],
  cabello: ['#2b2220', '#5a3a26', '#9a5b32', '#e0b25a', '#e8875c', '#d9798f', '#7e9fd1', '#8fb07a', '#f2f0ea'],
  ojos: ['#3b2f2a', '#3d6aa8', '#3f8a5a', '#8a5a2b', '#7a4fa0'],
  ropa: ['#e88fae', '#7fa6cf', '#8aa04f', '#f2c27f', '#f0f0ea', '#c96f5a', '#6b5bb0', '#3a3f55'],
  zapatos: ['#5a3a26', '#2b2b33', '#c96f5a', '#f0f0ea', '#7fa6cf'],
};

export const PERSONAJE_INICIAL = {
  genero: 0, cabello: 1, arriba: 0, abajo: 1, zapatos: 0,
  piel: 1, colorCabello: 1, ojos: 0, colorArriba: 0, colorAbajo: 1, colorZapatos: 0,
};

export function personajeAleatorio() {
  const r = (n) => Math.floor(Math.random() * n);
  return {
    genero: r(2), cabello: r(CABELLOS.length), arriba: r(ARRIBA.length), abajo: r(ABAJO.length), zapatos: r(ZAPATOS.length),
    piel: r(COLORES.piel.length), colorCabello: r(COLORES.cabello.length), ojos: r(COLORES.ojos.length),
    colorArriba: r(COLORES.ropa.length), colorAbajo: r(COLORES.ropa.length), colorZapatos: r(COLORES.zapatos.length),
  };
}

const oscurecer = (hex, f = 0.22) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.round(v * (1 - f)).toString(16).padStart(2, '0');
  return `#${c(n >> 16)}${c((n >> 8) & 255)}${c(n & 255)}`;
};

// Arma la cuadrícula de colores combinando las capas en orden.
function componer(p, parpadeo) {
  const g = Array.from({ length: ALTO }, () => Array(ANCHO).fill(null));
  const pintar = (mapa, paleta) => {
    const filas = Array.isArray(mapa) ? Object.fromEntries(mapa.map((f, i) => [i, f])) : mapa;
    for (const [y, fila] of Object.entries(filas)) {
      [...fila].forEach((letra, x) => {
        if (letra !== '.' && paleta[letra]) g[y][x] = paleta[letra];
      });
    }
  };
  const base = (hex) => ({ base: hex, sombra: oscurecer(hex) });
  const piel = base(COLORES.piel[p.piel]);
  const pelo = base(COLORES.cabello[p.colorCabello]);
  const arriba = base(COLORES.ropa[p.colorArriba]);
  const abajo = base(COLORES.ropa[p.colorAbajo]);
  const zap = base(COLORES.zapatos[p.colorZapatos]);
  const cabello = CABELLOS[p.cabello];

  if (cabello.atras) pintar(cabello.atras, { H: pelo.base, h: pelo.sombra });
  pintar(CUERPO, { S: piel.base, s: piel.sombra });
  pintar(parpadeo ? CARA_PARPADEO : CARA, {
    E: COLORES.ojos[p.ojos], e: oscurecer(piel.base, 0.45), w: '#ffffff', b: '#f2a0a0', m: '#b85c5c',
  });
  if (p.genero === 0) pintar(PESTANAS, { l: '#2b2220' });
  pintar(ABAJO[p.abajo].mapa, { P: abajo.base, p: abajo.sombra });
  pintar(ARRIBA[p.arriba].mapa, { C: arriba.base, c: arriba.sombra, D: '#fffdf6' });
  pintar(ZAPATOS[p.zapatos].mapa, { Z: zap.base, z: zap.sombra, D: '#fffdf6' });
  pintar(cabello.frente, { H: pelo.base, h: pelo.sombra, T: '#f0a39a' });
  return g;
}

const CONTORNO = '#3a2b3c';

// Dibuja el personaje en un canvas. `filas` permite recortar (p. ej. solo el busto).
export function dibujar(canvas, p, { escala = 8, filas = ALTO, parpadeo = false } = {}) {
  const g = componer({ ...PERSONAJE_INICIAL, ...p }, parpadeo);
  const ancho = ANCHO + 2, alto = filas + 2;
  canvas.width = ancho * escala;
  canvas.height = alto * escala;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const lleno = (x, y) => y >= 0 && y < filas && x >= 0 && x < ANCHO && g[y][x];
  for (let y = -1; y <= filas; y++) {
    for (let x = -1; x <= ANCHO; x++) {
      let color = lleno(x, y) ? g[y][x] : null;
      // Contorno automático alrededor de todo lo dibujado, como en el pixel art clásico.
      if (!color && (lleno(x - 1, y) || lleno(x + 1, y) || lleno(x, y - 1) || lleno(x, y + 1))) color = CONTORNO;
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect((x + 1) * escala, (y + 1) * escala, escala, escala);
    }
  }
}

// Canvas que parpadea solo de vez en cuando. Devuelve el elemento.
export function personajeVivo(p, opciones = {}) {
  const c = document.createElement('canvas');
  c.className = 'pixel';
  c.setAttribute('role', 'img');
  c.setAttribute('aria-label', 'Mi personaje');
  dibujar(c, p, opciones);
  const parpadear = () => {
    if (!c.isConnected && c.dataset.montado) return;
    if (c.isConnected) c.dataset.montado = '1';
    dibujar(c, p, { ...opciones, parpadeo: true });
    setTimeout(() => dibujar(c, p, opciones), 160);
    setTimeout(parpadear, 2500 + Math.random() * 3000);
  };
  setTimeout(parpadear, 1500 + Math.random() * 2000);
  return c;
}
