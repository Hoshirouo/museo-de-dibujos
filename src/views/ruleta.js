// "¿Qué dibujo hoy?": ruleta de 10 categorías con un reto al azar.
import { CATEGORIAS_RETO } from '../data/retos.js';
import { rueda, colorRueda } from '../rueda.js';
import { toast } from '../ui.js';
import { agregarMeta } from './metas.js';
import { formularioObra } from './galeria.js';

export default async function ruleta(el) {
  const r = rueda(CATEGORIAS_RETO.map((c) => ({ etiqueta: c.nombre })));
  let actual = null;

  el.innerHTML = `
    <div class="encabezado"><div><h1>¿Qué dibujo hoy?</h1><p>Gira la ruleta y te toca una categoría con un reto. Si no te convence, vuelve a girar.</p></div></div>
    <div class="ruleta-escena">
      <div><div data-rueda></div><button class="btn primario boton-girar" data-girar>🎡 Girar</button></div>
      <section class="papel cinta resultado-reto" aria-live="polite">
        <h2>Tu reto</h2>
        <p class="ayuda" data-vacio>Todavía no has girado la ruleta.</p>
        <div data-resultado hidden>
          <span class="categoria" data-cat></span>
          <p class="reto" data-reto></p>
          <div class="fila">
            <button class="btn chico" data-acc="otro">Otro reto de esta categoría</button>
            <button class="btn chico" data-acc="meta">+ Añadir a mis metas</button>
            <button class="btn chico" data-acc="colgar">Ya lo dibujé: colgar</button>
          </div>
        </div>
      </section>
    </div>`;
  el.querySelector('[data-rueda]').append(r.el);

  const mostrar = (cat, reto) => {
    actual = { cat, reto };
    el.querySelector('[data-vacio]').hidden = true;
    el.querySelector('[data-resultado]').hidden = false;
    const chip = el.querySelector('[data-cat]');
    chip.textContent = cat.nombre;
    chip.style.background = colorRueda(CATEGORIAS_RETO.indexOf(cat));
    el.querySelector('[data-reto]').textContent = reto;
  };
  const retoAzar = (cat, evitar) => {
    const opciones = cat.retos.filter((x) => x !== evitar);
    return opciones[Math.floor(Math.random() * opciones.length)];
  };

  el.querySelector('[data-girar]').addEventListener('click', async (e) => {
    e.target.disabled = true;
    const i = Math.floor(Math.random() * CATEGORIAS_RETO.length);
    await r.girar(i);
    mostrar(CATEGORIAS_RETO[i], retoAzar(CATEGORIAS_RETO[i]));
    e.target.disabled = false;
    e.target.textContent = '🎡 Girar otra vez';
  });

  el.addEventListener('click', async (e) => {
    const acc = e.target.closest('[data-acc]')?.dataset.acc;
    if (!acc || !actual) return;
    if (acc === 'otro') mostrar(actual.cat, retoAzar(actual.cat, actual.reto));
    if (acc === 'meta') {
      await agregarMeta(actual.reto);
      toast('Añadido a las metas de esta semana 📌');
    }
    if (acc === 'colgar') formularioObra(null, null, { titulo: actual.reto.replace(/\.$/, ''), categoria: 'Retos', nota: `Reto de ${actual.cat.nombre}` });
  });
}
