// Ajustes: marcos PNG propios, salas de la galería, cumpleaños y copia de seguridad.
import { todos, guardar, borrar, nuevoId, ajuste, guardarAjuste, exportarTodo, importarTodo } from '../db.js';
import { esc, urlDe, toast, confirmar, fechaISO } from '../ui.js';
import { categorias } from './galeria.js';
import { recargar } from '../main.js';

export default async function ajustes(el) {
  const [marcos, cats, eventos, defecto, uso] = await Promise.all([
    todos('marcos'), categorias(), todos('eventos'), ajuste('marcoPorDefecto', null), navigator.storage?.estimate?.(),
  ]);
  eventos.sort((a, b) => a.fecha.localeCompare(b.fecha));
  const mb = (n) => (n / 1024 / 1024).toFixed(1);

  el.innerHTML = `
    <div class="encabezado"><div><h1>Ajustes</h1></div></div>
    <div class="ajustes-grid">
      <section class="papel">
        <h2>Mis marcos</h2>
        <p class="ayuda">Sube un PNG con el centro transparente. El “margen” indica cuánto ocupa el borde del marco.</p>
        <div class="marcos-lista">
          <figure><div class="marco clasico" style="height:90px;padding:10px"><div style="background:#fff;height:100%"></div></div>
            <figcaption>Clásico ${!defecto ? '✓' : ''}</figcaption>
            ${defecto ? '<button class="btn chico" data-defecto="">Usar por defecto</button>' : ''}</figure>
          ${marcos
            .map(
              (m) => `<figure><img src="${urlDe(m.imagen)}" alt="${esc(m.nombre)}"><figcaption>${esc(m.nombre)} ${m.id === defecto ? '✓' : ''}</figcaption>
                <div class="fila" style="justify-content:center">
                  ${m.id === defecto ? '' : `<button class="btn chico" data-defecto="${m.id}">Por defecto</button>`}
                  <button class="btn chico peligro" data-borrar-marco="${m.id}" aria-label="Borrar marco">🗑</button></div></figure>`,
            )
            .join('')}
        </div>
        <form data-form="marco" style="margin-top:16px">
          <div class="campo"><label for="mi">Imagen PNG</label><input id="mi" type="file" name="imagen" accept="image/png,image/webp" required></div>
          <div class="fila">
            <div class="campo" style="flex:2"><label for="mn">Nombre</label><input id="mn" name="nombre" required maxlength="30"></div>
            <div class="campo" style="flex:1"><label for="mx">Margen %</label><input id="mx" name="inset" type="number" min="0" max="40" value="12"></div>
          </div>
          <button class="btn primario">Subir marco</button>
        </form>
      </section>

      <section class="papel">
        <h2>Salas de la galería</h2>
        <ul class="lista-simple">
          ${cats.map((c, i) => `<li><span>${esc(c)}</span><button class="btn chico" data-quitar-cat="${i}" aria-label="Quitar sala ${esc(c)}">Quitar</button></li>`).join('')}
        </ul>
        <form data-form="cat" class="fila"><input name="nombre" required maxlength="40" placeholder="Nueva sala" aria-label="Nueva sala" style="flex:1;min-height:44px;padding:8px 12px;border-radius:10px;border:2px solid var(--salvia-osc)"><button class="btn">Añadir</button></form>
        <p class="ayuda">Quitar una sala no borra sus obras; siguen apareciendo en “Todas”.</p>
      </section>

      <section class="papel">
        <h2>Cumpleaños y fechas especiales</h2>
        <p class="ayuda">Ese día el calendario cambia la palabra por un reto temático. Los feriados de Perú ya vienen incluidos.</p>
        <ul class="lista-simple">
          ${eventos.map((ev) => `<li><span>🎂 ${esc(ev.nombre)} · ${ev.fecha.split('-').reverse().join('/')}</span><button class="btn chico" data-borrar-evento="${ev.id}">Quitar</button></li>`).join('') || '<li class="ayuda">Ninguna todavía.</li>'}
        </ul>
        <form data-form="evento">
          <div class="fila">
            <div class="campo" style="flex:2"><label for="en">Nombre</label><input id="en" name="nombre" required maxlength="40" placeholder="Ej: Mamá"></div>
            <div class="campo" style="flex:1"><label for="ef">Fecha</label><input id="ef" name="fecha" type="date" required></div>
          </div>
          <button class="btn">Añadir fecha</button>
        </form>
      </section>

      <section class="papel">
        <h2>Copia de seguridad</h2>
        <p>Todo se guarda en este dispositivo. Descarga una copia de vez en cuando y guárdala en tu Drive o en un USB.</p>
        ${uso ? `<p class="ayuda">Espacio usado: ${mb(uso.usage)} MB</p>` : ''}
        <div class="fila">
          <button class="btn primario" data-exportar>Descargar copia</button>
          <label class="btn">Restaurar copia<input type="file" accept=".zip,application/zip" hidden data-importar></label>
        </div>
        <p class="ayuda">Restaurar reemplaza todo lo que hay ahora por lo de la copia. También sirve para pasar tus dibujos de la PC a la tablet.</p>
      </section>
    </div>`;

  el.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const tipo = e.target.dataset.form;
    if (tipo === 'marco') {
      await guardar('marcos', { id: nuevoId(), nombre: f.get('nombre').trim(), inset: Math.max(0, Math.min(40, +f.get('inset') || 0)), imagen: f.get('imagen') });
      toast('Marco guardado 🖼️');
    } else if (tipo === 'cat') {
      const nombre = f.get('nombre').trim();
      if (!cats.includes(nombre)) await guardarAjuste('categorias', [...cats, nombre]);
    } else if (tipo === 'evento') {
      await guardar('eventos', { id: nuevoId(), nombre: f.get('nombre').trim(), fecha: f.get('fecha').slice(5) });
      toast('Fecha guardada 🎂');
    }
    recargar();
  });

  el.addEventListener('click', async (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.defecto !== undefined) {
      await guardarAjuste('marcoPorDefecto', t.dataset.defecto || null);
      recargar();
    } else if (t.dataset.borrarMarco && (await confirmar('¿Borrar este marco? Las obras que lo usan volverán al marco por defecto.'))) {
      await borrar('marcos', t.dataset.borrarMarco);
      if (defecto === t.dataset.borrarMarco) await guardarAjuste('marcoPorDefecto', null);
      recargar();
    } else if (t.dataset.quitarCat !== undefined) {
      await guardarAjuste('categorias', cats.filter((_, i) => i !== +t.dataset.quitarCat));
      recargar();
    } else if (t.dataset.borrarEvento) {
      await borrar('eventos', t.dataset.borrarEvento);
      recargar();
    } else if (t.hasAttribute('data-exportar')) {
      t.disabled = true;
      t.textContent = 'Preparando…';
      try {
        const zip = await exportarTodo();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(zip);
        a.download = `museo-dibujos-${fechaISO()}.zip`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        await guardarAjuste('ultimaCopia', Date.now());
      } finally {
        t.disabled = false;
        t.textContent = 'Descargar copia';
      }
    }
  });

  el.querySelector('[data-importar]').addEventListener('change', async (e) => {
    const archivo = e.target.files[0];
    if (!archivo || !(await confirmar('Esto reemplazará todo lo que hay ahora con la copia. ¿Continuar?'))) return (e.target.value = '');
    try {
      await importarTodo(archivo);
      toast('Copia restaurada ✓');
      recargar();
    } catch (err) {
      toast('No se pudo restaurar: ' + err.message);
    }
  });
}
