// Galería tipo museo: cuadros enmarcados, filtros por categoría y ficha de cada obra.
import { todos, guardar, borrar, nuevoId, ajuste, guardarAjuste } from '../db.js';
import { esc, urlDe, modal, confirmar, toast, miniatura, fechaISO, fechaBonita, transicion, visor, celebrar, escalonar } from '../ui.js';
import { recargar } from '../main.js';

export const CATEGORIAS_INICIALES = ['Renders', 'Personajes', 'Fanart', 'Teoría del color', 'Escenarios', 'Retos', 'Otros'];
export const categorias = () => ajuste('categorias', CATEGORIAS_INICIALES);

// Un cuadro con su marco: el clásico dorado o un PNG hecho por ella.
export function marcoHTML(src, marco, alt = '') {
  if (!marco) return `<div class="marco clasico"><img src="${src}" alt="${esc(alt)}" loading="lazy"></div>`;
  return `<div class="marco png" style="--inset:${marco.inset}%">
    <img src="${src}" alt="${esc(alt)}" loading="lazy"><img class="marco-img" src="${urlDe(marco.imagen)}" alt=""></div>`;
}

export default async function galeria(el, [filtroInicial]) {
  const [obras, marcos, cats, marcoDefecto] = await Promise.all([todos('obras'), todos('marcos'), categorias(), ajuste('marcoPorDefecto', null)]);
  obras.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '') || (b.creado || 0) - (a.creado || 0));
  const marcoDe = (o) => marcos.find((m) => m.id === (o.marcoId || marcoDefecto)) || null;
  let filtro = filtroInicial || 'Todas';

  el.innerHTML = `
    <div class="encabezado">
      <div><h1>Galería</h1><p>Las obras terminadas, colgadas por salas.</p></div>
      <button class="btn primario" data-acc="subir">+ Colgar obra</button>
    </div>
    <div class="galeria-filtros" role="toolbar" aria-label="Filtrar por sala">
      ${['Todas', '★ Favoritas', ...cats].map((c) => `<button class="chip" data-filtro="${esc(c)}">${esc(c)}</button>`).join('')}
    </div>
    <div class="pared"><div class="cuadros"></div></div>`;

  const cuadros = el.querySelector('.cuadros');
  const urls = new Map(obras.map((o) => [o.id, urlDe(o.mini || o.imagen)]));

  function pintar() {
    el.querySelectorAll('[data-filtro]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.filtro === filtro));
    const visibles = obras.filter((o) => filtro === 'Todas' || (filtro === '★ Favoritas' ? o.favorito : o.categoria === filtro));
    cuadros.innerHTML = visibles.length
      ? visibles
          .map(
            (o) => `<button class="cuadro" data-id="${o.id}" aria-label="Ver ${esc(o.titulo)}">
              ${marcoHTML(urls.get(o.id), marcoDe(o), o.titulo)}
              <span class="placa">${o.favorito ? '<span class="fav">★</span> ' : ''}${esc(o.titulo)}</span>
            </button>`,
          )
          .join('')
      : `<div class="vacio papel" style="grid-column:1/-1"><h2>Sala vacía</h2><p>${obras.length ? 'No hay obras en esta sala todavía.' : 'Cuelga tu primera obra con el botón “Colgar obra”.'}</p></div>`;
    escalonar(cuadros);
  }
  pintar();

  el.addEventListener('click', async (e) => {
    const f = e.target.closest('[data-filtro]');
    if (f) return (filtro = f.dataset.filtro), pintar();
    if (e.target.closest('[data-acc="subir"]')) return formularioObra(null, filtro);
    const c = e.target.closest('.cuadro');
    if (c) abrirFicha(c, obras.find((o) => o.id === c.dataset.id), marcos);
  });
}

async function abrirFicha(boton, obra, marcos) {
  const miniImg = boton.querySelector('.marco img');
  const completa = urlDe(obra.imagen);
  let d;
  let cambiado = false;
  miniImg.style.viewTransitionName = 'obra';
  await transicion(() => {
    miniImg.style.viewTransitionName = '';
    d = modal(
      `<div class="ficha">
        <img class="ficha-img" src="${completa}" alt="${esc(obra.titulo)}" style="view-transition-name:obra">
        <div>
          <div class="fila" style="justify-content:space-between">
            <h2 style="margin:0">${esc(obra.titulo)}</h2>
            <button class="btn-fav" data-acc="fav" aria-pressed="${!!obra.favorito}" aria-label="Favorito">${obra.favorito ? '★' : '☆'}</button>
          </div>
          <dl>
            <dt>Fecha</dt><dd>${fechaBonita(obra.fecha)}</dd>
            <dt>Sala</dt><dd>${esc(obra.categoria)}</dd>
            ${obra.nota ? `<dt>Nota</dt><dd>${esc(obra.nota).replace(/\n/g, '<br>')}</dd>` : ''}
          </dl>
          ${obra.timelapse ? `<div class="timelapse-caja"><strong>Timelapse</strong><video src="${urlDe(obra.timelapse)}" controls playsinline preload="metadata"></video></div>` : ''}
          <div class="acciones">
            <button class="btn peligro chico" data-acc="borrar">Borrar</button>
            <button class="btn chico" data-acc="editar">Editar</button>
          </div>
        </div>
      </div>`,
      { clase: 'ancho', alCerrar: () => cambiado && recargar() },
    );
  });
  d.querySelector('.ficha-img').addEventListener('click', () => visor(completa, obra.titulo));
  d.addEventListener('click', async (e) => {
    const acc = e.target.closest('[data-acc]')?.dataset.acc;
    if (acc === 'fav') {
      obra.favorito = !obra.favorito;
      await guardar('obras', obra);
      e.target.textContent = obra.favorito ? '★' : '☆';
      e.target.setAttribute('aria-pressed', obra.favorito);
      cambiado = true;
    } else if (acc === 'borrar' && (await confirmar(`¿Borrar “${obra.titulo}” de la galería?`))) {
      await borrar('obras', obra.id);
      cambiado = true;
      d.close();
      toast('Obra borrada');
    } else if (acc === 'editar') {
      d.close();
      formularioObra(obra);
    }
  });
}

// Formulario para colgar o editar una obra. `extra` permite usarlo desde otras zonas.
export async function formularioObra(obra, filtroActual, extra = {}) {
  const [cats, marcos] = await Promise.all([categorias(), todos('marcos')]);
  const nueva = !obra;
  const o = obra || { fecha: fechaISO(), categoria: cats.includes(filtroActual) ? filtroActual : cats[0], ...extra };
  const d = modal(`
    <h2>${nueva ? 'Colgar obra' : 'Editar obra'}</h2>
    <form>
      <div class="campo"><label for="oi">Imagen ${nueva ? '' : '(déjala vacía para mantenerla)'}</label>
        <input id="oi" name="imagen" type="file" accept="image/*" ${nueva ? 'required' : ''}></div>
      <div class="campo"><label for="ot">Título</label><input id="ot" name="titulo" required maxlength="80" value="${esc(o.titulo || '')}"></div>
      <div class="fila">
        <div class="campo" style="flex:1"><label for="of">Fecha</label><input id="of" name="fecha" type="date" required value="${o.fecha}"></div>
        <div class="campo" style="flex:1"><label for="oc">Sala</label>
          <select id="oc" name="categoria">${[...new Set([...cats, o.categoria])].map((c) => `<option ${c === o.categoria ? 'selected' : ''}>${esc(c)}</option>`).join('')}
            <option value="__nueva">+ Nueva sala…</option></select></div>
      </div>
      <div class="campo" hidden data-nueva-cat><label for="on">Nombre de la sala nueva</label><input id="on" name="nuevaCat" maxlength="40"></div>
      <div class="campo"><label for="ont">Nota</label><textarea id="ont" name="nota" maxlength="1000">${esc(o.nota || '')}</textarea></div>
      <div class="campo"><label for="otl">Timelapse (video, opcional)</label><input id="otl" name="timelapse" type="file" accept="video/*">
        ${o.timelapse ? '<label class="ayuda"><input type="checkbox" name="quitarTl"> Quitar el timelapse actual</label>' : ''}</div>
      <div class="campo"><label for="om">Marco</label>
        <select id="om" name="marco"><option value="">Marco por defecto</option>
          ${marcos.map((m) => `<option value="${m.id}" ${m.id === o.marcoId ? 'selected' : ''}>${esc(m.nombre)}</option>`).join('')}</select>
        <span class="ayuda">Puedes subir tus propios marcos PNG en ⚙ Ajustes.</span></div>
      <label class="fila"><input type="checkbox" name="favorito" ${o.favorito ? 'checked' : ''}> ★ Favorita</label>
      <div class="acciones"><button class="btn primario">Guardar</button></div>
    </form>`);
  const form = d.querySelector('form');
  form.categoria.addEventListener('change', () => {
    const nuevaCat = d.querySelector('[data-nueva-cat]');
    nuevaCat.hidden = form.categoria.value !== '__nueva';
    form.nuevaCat.required = !nuevaCat.hidden;
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button.primario');
    btn.disabled = true;
    btn.textContent = 'Guardando…';
    const f = new FormData(form);
    let categoria = f.get('categoria');
    if (categoria === '__nueva') {
      categoria = f.get('nuevaCat').trim();
      if (!cats.includes(categoria)) await guardarAjuste('categorias', [...cats, categoria]);
    }
    const img = f.get('imagen');
    const tl = f.get('timelapse');
    const registro = {
      ...o,
      id: o.id || nuevoId(),
      titulo: f.get('titulo').trim(),
      fecha: f.get('fecha'),
      categoria,
      nota: f.get('nota').trim(),
      favorito: f.get('favorito') === 'on',
      marcoId: f.get('marco') || null,
      creado: o.creado || Date.now(),
    };
    if (img && img.size) {
      registro.imagen = img;
      registro.mini = await miniatura(img);
    }
    if (tl && tl.size) registro.timelapse = tl;
    else if (f.get('quitarTl')) registro.timelapse = null;
    try {
      await guardar('obras', registro);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Guardar';
      return toast('No se pudo guardar: ' + err.message);
    }
    d.close();
    toast(nueva ? '¡Obra colgada! 🖼️' : 'Cambios guardados');
    if (nueva) celebrar(24);
    if (location.hash.startsWith('#/galeria')) recargar();
  });
}

