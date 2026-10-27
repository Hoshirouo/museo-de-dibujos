// Biblioteca de cuadernos de bocetos: estantes con libros y un cuaderno que se hojea.
import { todos, obtener, porIndice, guardar, borrar, borrarCuaderno, nuevoId } from '../db.js';
import { esc, urlDe, modal, confirmar, toast, miniatura, visor } from '../ui.js';
import { recargar } from '../main.js';

const COLORES_LIBRO = ['#5f7f5b', '#c8644a', '#365680', '#e6b85c', '#9b7ec8', '#2f8a6f', '#e68fac', '#6e4a33', '#14707a', '#2b3a6b'];
const ADORNOS = ['🪴', '🐈', '🕯️', '🌵', '🏺', '🧸'];
const POR_ESTANTE = 9;

// Altura fija por libro a partir de su id, para que no salten al recargar.
const alturaDe = (id) => 140 + ([...id].reduce((s, c) => s + c.charCodeAt(0), 0) % 40);

export default async function bocetos(el, [id]) {
  if (id) return cuaderno(el, id);
  const cuadernos = (await todos('cuadernos')).sort((a, b) => a.creado - b.creado);
  const paginas = await todos('paginas');
  const cuenta = (cid) => paginas.filter((p) => p.cuadernoId === cid).length;

  const libros = [
    ...cuadernos.map(
      (c) => `<a class="lomo" href="#/bocetos/${c.id}" style="background:${c.color};height:${alturaDe(c.id)}px" title="${esc(c.nombre)} · ${cuenta(c.id)} páginas"><span>${esc(c.nombre)}</span></a>`,
    ),
    `<button class="lomo nuevo" data-acc="nuevo" style="height:150px" aria-label="Nuevo cuaderno"><span>+ Nuevo cuaderno</span></button>`,
  ];
  const estantes = [];
  for (let i = 0; i < Math.max(libros.length, 1); i += POR_ESTANTE) {
    const n = estantes.length;
    estantes.push(`<div class="estante">${libros.slice(i, i + POR_ESTANTE).join('')}<span class="adorno" aria-hidden="true">${ADORNOS[n % ADORNOS.length]}</span></div>`);
  }
  // Siempre al menos dos estantes para que parezca una librería.
  if (estantes.length < 2) estantes.push(`<div class="estante"><span class="adorno" aria-hidden="true">📚</span><span class="adorno" aria-hidden="true">🪴</span></div>`);

  el.innerHTML = `
    <div class="encabezado">
      <div><h1>Bocetos</h1><p>Cada libro es un cuaderno de dibujo. Ábrelo para hojearlo o añadirle páginas.</p></div>
      <button class="btn primario" data-acc="nuevo">+ Nuevo cuaderno</button>
    </div>
    <div class="libreria">${estantes.join('')}</div>`;

  el.addEventListener('click', (e) => e.target.closest('[data-acc="nuevo"]') && formularioCuaderno());
}

function formularioCuaderno(c) {
  const nuevo = !c;
  c = c || { color: COLORES_LIBRO[Math.floor(Math.random() * COLORES_LIBRO.length)] };
  const d = modal(`
    <h2>${nuevo ? 'Nuevo cuaderno' : 'Editar cuaderno'}</h2>
    <form>
      <div class="campo"><label for="cn">Nombre</label><input id="cn" name="nombre" required maxlength="40" value="${esc(c.nombre || '')}" placeholder="Ej: Sketchbook 2026"></div>
      <div class="campo"><span>Color de la tapa</span>
        <div class="fila">${COLORES_LIBRO.map((col) => `<label style="cursor:pointer"><input type="radio" name="color" value="${col}" ${col === c.color ? 'checked' : ''} style="accent-color:${col}"> <i style="display:inline-block;width:26px;height:26px;border-radius:6px;background:${col};vertical-align:middle"></i></label>`).join('')}</div></div>
      <div class="acciones"><button class="btn primario">Guardar</button></div>
    </form>`);
  d.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const registro = { ...c, id: c.id || nuevoId(), nombre: f.get('nombre').trim(), color: f.get('color') || c.color, creado: c.creado || Date.now() };
    await guardar('cuadernos', registro);
    d.close();
    if (nuevo) location.hash = `#/bocetos/${registro.id}`;
    else recargar();
  });
}

async function cuaderno(el, id) {
  const c = await obtener('cuadernos', id);
  if (!c) {
    el.innerHTML = `<div class="vacio papel"><h2>Ese cuaderno ya no existe</h2><a class="btn" href="#/bocetos">Volver a la biblioteca</a></div>`;
    return;
  }
  const paginas = (await porIndice('paginas', 'cuaderno', id)).sort((a, b) => a.orden - b.orden);
  const urls = paginas.map((p) => urlDe(p.mini || p.imagen));
  const angosto = matchMedia('(max-width: 640px)');
  let pos = 0;

  el.innerHTML = `
    <div class="encabezado">
      <div><a href="#/bocetos" class="ayuda">← Biblioteca</a><h1>${esc(c.nombre)}</h1><p>${paginas.length} páginas</p></div>
      <div class="fila">
        <button class="btn chico" data-acc="editar">Editar</button>
        <button class="btn chico peligro" data-acc="borrar-cuaderno">Borrar cuaderno</button>
        <label class="btn primario">+ Añadir páginas<input type="file" accept="image/*" multiple hidden data-subir></label>
      </div>
    </div>
    <div class="cuaderno-abierto">
      <div class="libro" style="--libro:${c.color}"></div>
      <div class="paginador">
        <button class="btn" data-acc="atras" aria-label="Página anterior">←</button>
        <span class="ayuda" data-indicador></span>
        <button class="btn" data-acc="adelante" aria-label="Página siguiente">→</button>
      </div>
    </div>`;

  const libro = el.querySelector('.libro');
  const paso = () => (angosto.matches ? 1 : 2);

  const hoja = (i, lado) => {
    const p = paginas[i];
    if (!p) return `<div class="hoja vacia">${i === paginas.length ? 'Página en blanco<br>✏️' : ''}</div>`;
    return `<div class="hoja"><img src="${urls[i]}" alt="Página ${i + 1}" data-pag="${i}">
      <span class="num ${lado}">${i + 1}</span>
      <button class="btn chico peligro borrar-hoja" data-acc="borrar-pag" data-i="${i}" aria-label="Borrar página ${i + 1}">🗑</button></div>`;
  };

  function pintar(direccion) {
    pos = Math.max(0, Math.min(pos - (pos % paso()), Math.max(0, paginas.length - 1)));
    pos -= pos % paso();
    libro.innerHTML = hoja(pos, 'izq') + (paso() === 2 ? hoja(pos + 1, 'der') : '');
    libro.classList.remove('pasa-adelante', 'pasa-atras');
    if (direccion) {
      void libro.offsetWidth;
      libro.classList.add(direccion);
    }
    const ultima = Math.min(pos + paso(), paginas.length);
    el.querySelector('[data-indicador]').textContent = paginas.length ? `Páginas ${pos + 1}${ultima > pos + 1 ? `–${ultima}` : ''} de ${paginas.length}` : 'Cuaderno vacío: añade tus páginas';
    el.querySelector('[data-acc="atras"]').disabled = pos === 0;
    el.querySelector('[data-acc="adelante"]').disabled = pos + paso() >= paginas.length;
  }
  const avanzar = (n) => {
    const antes = pos;
    pos = Math.max(0, pos + n * paso());
    if (pos >= paginas.length) pos = antes;
    if (pos !== antes) pintar(n > 0 ? 'pasa-adelante' : 'pasa-atras');
  };
  pintar();
  angosto.addEventListener('change', () => pintar());

  // Teclado y deslizar con el dedo.
  const teclas = (e) => {
    if (!el.isConnected) return document.removeEventListener('keydown', teclas);
    if (document.querySelector('dialog[open]')) return;
    if (e.key === 'ArrowRight') avanzar(1);
    if (e.key === 'ArrowLeft') avanzar(-1);
  };
  document.addEventListener('keydown', teclas);
  let x0 = null;
  libro.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  libro.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) avanzar(dx < 0 ? 1 : -1);
    x0 = null;
  });

  el.querySelector('[data-subir]').addEventListener('change', async (e) => {
    const archivos = [...e.target.files];
    if (!archivos.length) return;
    toast(`Añadiendo ${archivos.length} página(s)…`);
    let orden = paginas.length ? paginas[paginas.length - 1].orden + 1 : 0;
    for (const archivo of archivos) {
      await guardar('paginas', { id: nuevoId(), cuadernoId: id, orden: orden++, imagen: archivo, mini: await miniatura(archivo, 1400), creado: Date.now() });
    }
    toast('Páginas añadidas ✏️');
    recargar();
  });

  el.addEventListener('click', async (e) => {
    const img = e.target.closest('[data-pag]');
    if (img) return visor(urlDe(paginas[+img.dataset.pag].imagen), `Página ${+img.dataset.pag + 1}`);
    const acc = e.target.closest('[data-acc]');
    if (!acc) return;
    switch (acc.dataset.acc) {
      case 'atras': return avanzar(-1);
      case 'adelante': return avanzar(1);
      case 'editar': return formularioCuaderno(c);
      case 'borrar-pag':
        if (await confirmar(`¿Borrar la página ${+acc.dataset.i + 1}?`)) {
          await borrar('paginas', paginas[+acc.dataset.i].id);
          recargar();
        }
        return;
      case 'borrar-cuaderno':
        if (await confirmar(`¿Borrar el cuaderno “${c.nombre}” y sus ${paginas.length} páginas?`)) {
          await borrarCuaderno(id);
          toast('Cuaderno borrado');
          location.hash = '#/bocetos';
        }
    }
  });
}
