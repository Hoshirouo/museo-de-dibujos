// Creador de personaje: vista previa grande, flechas para cada prenda y muestras de color.
import { modal, celebrar } from './ui.js';
import { dibujar, CABELLOS, ARRIBA, ABAJO, ZAPATOS, GENEROS, COLORES, PERSONAJE_INICIAL, personajeAleatorio } from './personaje.js';

const OPCIONES = [
  ['genero', 'Cuerpo', GENEROS],
  ['cabello', 'Cabello', CABELLOS.map((c) => c.nombre)],
  ['arriba', 'Arriba', ARRIBA.map((c) => c.nombre)],
  ['abajo', 'Abajo', ABAJO.map((c) => c.nombre)],
  ['zapatos', 'Zapatos', ZAPATOS.map((c) => c.nombre)],
];

const PALETAS = [
  ['piel', 'Piel', COLORES.piel],
  ['colorCabello', 'Color de cabello', COLORES.cabello],
  ['ojos', 'Ojos', COLORES.ojos],
  ['colorArriba', 'Color de arriba', COLORES.ropa],
  ['colorAbajo', 'Color de abajo', COLORES.ropa],
  ['colorZapatos', 'Color de zapatos', COLORES.zapatos],
];

// Abre el creador. Resuelve con el personaje guardado, o null si se cerró sin guardar.
export function abrirCreador(actual, { bienvenida = false } = {}) {
  return new Promise((resolver) => {
    const p = { ...PERSONAJE_INICIAL, ...actual };
    let guardado = null;
    const d = modal(
      `${bienvenida ? '<p class="ayuda" style="margin:0">¡Bienvenida a tu museo! ✿</p>' : ''}
      <h2>Crea tu personaje</h2>
      <div class="creador">
        <div class="creador-vista">
          <div class="creador-escenario"><canvas class="pixel" data-vista aria-label="Vista previa del personaje" role="img"></canvas></div>
          <button class="btn chico" data-azar>🎲 Aleatorio</button>
        </div>
        <div class="creador-opciones">
          ${OPCIONES.map(
            ([clave, titulo]) => `<div class="creador-fila">
              <span>${titulo}</span>
              <div class="selector">
                <button class="flecha" data-clave="${clave}" data-paso="-1" aria-label="${titulo} anterior">◀</button>
                <output data-valor="${clave}"></output>
                <button class="flecha" data-clave="${clave}" data-paso="1" aria-label="${titulo} siguiente">▶</button>
              </div></div>`,
          ).join('')}
          ${PALETAS.map(
            ([clave, titulo, colores]) => `<div class="creador-fila colores">
              <span>${titulo}</span>
              <div class="muestras" role="radiogroup" aria-label="${titulo}">
                ${colores.map((c, i) => `<button class="muestra" role="radio" data-color="${clave}" data-i="${i}" style="background:${c}" aria-label="${titulo} ${i + 1}"></button>`).join('')}
              </div></div>`,
          ).join('')}
        </div>
      </div>
      <div class="acciones"><button class="btn primario" data-guardar>¡Listo! Guardar</button></div>`,
      { clase: 'ancho', alCerrar: () => resolver(guardado) },
    );

    const vista = d.querySelector('[data-vista]');
    const pintar = () => {
      dibujar(vista, p, { escala: 12 });
      OPCIONES.forEach(([clave, , nombres]) => (d.querySelector(`[data-valor="${clave}"]`).textContent = nombres[p[clave]]));
      d.querySelectorAll('[data-color]').forEach((b) => b.setAttribute('aria-checked', p[b.dataset.color] === +b.dataset.i));
    };
    pintar();

    d.addEventListener('click', (e) => {
      const flecha = e.target.closest('[data-paso]');
      if (flecha) {
        const [, , nombres] = OPCIONES.find(([c]) => c === flecha.dataset.clave);
        p[flecha.dataset.clave] = (p[flecha.dataset.clave] + +flecha.dataset.paso + nombres.length) % nombres.length;
        vista.classList.remove('salto');
        void vista.offsetWidth;
        vista.classList.add('salto');
        return pintar();
      }
      const muestra = e.target.closest('[data-color]');
      if (muestra) return (p[muestra.dataset.color] = +muestra.dataset.i), pintar();
      if (e.target.closest('[data-azar]')) return Object.assign(p, personajeAleatorio()), pintar();
      if (e.target.closest('[data-guardar]')) {
        guardado = { ...p };
        celebrar(28);
        d.close();
      }
    });
  });
}
