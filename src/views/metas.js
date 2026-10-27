// Metas de la semana. Algunas se llenan solas a partir de lo que se sube.
import { todos, porIndice, guardar, borrar, nuevoId } from '../db.js';
import { esc, fechaISO, deISO, inicioSemana, fechaBonita, modal, toast } from '../ui.js';
import { recargar } from '../main.js';

const METAS_INICIALES = [
  { texto: 'Dibujar 5 días esta semana', objetivo: 5, auto: 'dias' },
  { texto: 'Completar 3 bocetos', objetivo: 3, auto: 'bocetos' },
  { texto: 'Practicar anatomía durante 1 hora', objetivo: 1 },
  { texto: 'Terminar un dibujo que tengo pendiente', objetivo: 1 },
  { texto: 'Hacer un dibujo de un personaje que me guste', objetivo: 1 },
];

const finSemana = (lunes) => {
  const d = new Date(lunes);
  d.setDate(d.getDate() + 7);
  return d;
};

// Días (YYYY-MM-DD) de la semana en que se subió algo: obra, dibujo diario o boceto.
export async function diasDibujados(lunes) {
  const desde = fechaISO(lunes), hasta = fechaISO(finSemana(lunes));
  const [obras, diario, paginas] = await Promise.all([todos('obras'), todos('diario'), todos('paginas')]);
  const fechas = [...obras.map((o) => o.fecha), ...diario.map((d) => d.fecha), ...paginas.map((p) => fechaISO(new Date(p.creado)))];
  return new Set(fechas.filter((f) => f && f >= desde && f < hasta));
}

async function bocetosDeSemana(lunes) {
  const desde = lunes.getTime(), hasta = finSemana(lunes).getTime();
  return (await todos('paginas')).filter((p) => p.creado >= desde && p.creado < hasta).length;
}

export async function agregarMeta(texto, objetivo = 1) {
  await guardar('metas', { id: nuevoId(), semana: fechaISO(inicioSemana()), texto, objetivo, progreso: 0, auto: null });
}

async function metasDe(semana) {
  let metas = await porIndice('metas', 'semana', semana);
  // La semana actual empieza con las metas sugeridas si está vacía.
  if (!metas.length && semana === fechaISO(inicioSemana())) {
    metas = METAS_INICIALES.map((m, i) => ({ id: nuevoId(), semana, progreso: 0, auto: null, orden: i, ...m }));
    await Promise.all(metas.map((m) => guardar('metas', m)));
  }
  return metas.sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99) || a.texto.localeCompare(b.texto));
}

export default async function metas(el, [semanaParam]) {
  const lunes = semanaParam ? deISO(semanaParam) : inicioSemana();
  const semana = fechaISO(lunes);
  const esActual = semana === fechaISO(inicioSemana());
  const lista = await metasDe(semana);
  const dias = await diasDibujados(lunes);
  const bocetos = await bocetosDeSemana(lunes);
  const progresoDe = (m) => (m.auto === 'dias' ? dias.size : m.auto === 'bocetos' ? bocetos : m.progreso);
  const mover = (n) => {
    const d = new Date(lunes);
    d.setDate(d.getDate() + n * 7);
    return `#/metas/${fechaISO(d)}`;
  };
  const hoy = fechaISO();

  el.innerHTML = `
    <div class="encabezado">
      <div><h1>Metas de la semana</h1><p>Semana del ${fechaBonita(semana)}</p></div>
      <div class="fila">
        <a class="btn chico" href="${mover(-1)}">← Anterior</a>
        ${esActual ? '' : '<a class="btn chico" href="#/metas">Esta semana</a>'}
        <a class="btn chico" href="${mover(1)}">Siguiente →</a>
      </div>
    </div>
    <div class="metas-escena">
      <section class="papel cinta">
        ${lista.length ? '' : '<p class="vacio">No hay metas para esta semana.</p>'}
        <ul class="lista-metas">
          ${lista
            .map((m) => {
              const p = Math.min(progresoDe(m), m.objetivo);
              return `<li class="meta ${p >= m.objetivo ? 'cumplida' : ''}" data-id="${m.id}">
                <div><div class="meta-texto">${esc(m.texto)}</div>
                  <span class="ayuda">${p} de ${m.objetivo}${m.auto ? ' · se cuenta sola' : ''}</span></div>
                <div class="meta-ctrl">
                  ${m.auto ? '' : `<button class="btn chico" data-acc="menos" aria-label="Restar">−</button><button class="btn chico" data-acc="mas" aria-label="Sumar">+</button>`}
                  <button class="btn chico" data-acc="borrar" aria-label="Borrar meta">🗑</button>
                </div>
                <div class="meta-barra">${Array.from({ length: m.objetivo }, (_, i) => `<i class="${i < p ? 'lleno' : ''}"></i>`).join('')}</div>
              </li>`;
            })
            .join('')}
        </ul>
        <div class="acciones"><button class="btn primario" data-acc="nueva">+ Nueva meta</button></div>
      </section>
      <aside class="papel">
        <h2>Días dibujando</h2>
        <div class="semana-dias">
          ${['L', 'M', 'M', 'J', 'V', 'S', 'D']
            .map((letra, i) => {
              const d = new Date(lunes);
              d.setDate(d.getDate() + i);
              const iso = fechaISO(d);
              return `<div class="${dias.has(iso) ? 'si' : ''} ${iso === hoy ? 'hoy' : ''}" title="${fechaBonita(iso)}">${letra}</div>`;
            })
            .join('')}
        </div>
        <p class="ayuda" style="margin-top:14px">Un día cuenta si subiste una obra a la galería, el dibujo del calendario o una página de boceto.</p>
      </aside>
    </div>`;

  el.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-acc]');
    if (!b) return;
    const id = b.closest('.meta')?.dataset.id;
    const meta = lista.find((m) => m.id === id);
    if (b.dataset.acc === 'mas' || b.dataset.acc === 'menos') {
      meta.progreso = Math.max(0, Math.min(meta.objetivo, meta.progreso + (b.dataset.acc === 'mas' ? 1 : -1)));
      await guardar('metas', meta);
      if (meta.progreso === meta.objetivo) toast('¡Meta cumplida! 🌟');
      recargar();
    } else if (b.dataset.acc === 'borrar') {
      await borrar('metas', id);
      recargar();
    } else if (b.dataset.acc === 'nueva') {
      const d = modal(`
        <h2>Nueva meta</h2>
        <form>
          <div class="campo"><label for="mt">¿Qué quieres lograr?</label><input id="mt" name="texto" required maxlength="120" placeholder="Ej: Dibujar 3 paisajes"></div>
          <div class="campo"><label for="mo">¿Cuántas veces?</label><input id="mo" name="objetivo" type="number" min="1" max="14" value="1" required></div>
          <div class="acciones"><button class="btn primario">Guardar</button></div>
        </form>`);
      d.querySelector('form').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const f = new FormData(ev.target);
        await guardar('metas', { id: nuevoId(), semana, texto: f.get('texto').trim(), objetivo: +f.get('objetivo'), progreso: 0, auto: null, orden: lista.length });
        d.close();
        recargar();
      });
    }
  });
}
