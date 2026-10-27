// Calendario del reto diario: una palabra al día, un color por mes,
// miniaturas de cada dibujo y una ruleta de premios al completar el de hoy.
import { todos, obtener, guardar, borrar, nuevoId, sumarInventario, ajuste, guardarAjuste } from '../db.js';
import { esc, urlDe, modal, confirmar, toast, miniatura, fechaISO, deISO, fechaBonita, MESES, visor, celebrar } from '../ui.js';
import { retoDelDia } from '../data/calendario.js';
import { segmentosPremio, estacion } from '../data/premios.js';
import { rueda } from '../rueda.js';
import { recargar } from '../main.js';

const DIAS_SEM = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default async function calendario(el, [mesParam]) {
  const hoyISO = fechaISO();
  const hoy = deISO(hoyISO);
  const [anio, mes] = mesParam ? mesParam.split('-').map(Number) : [hoy.getFullYear(), hoy.getMonth() + 1];
  const primero = new Date(anio, mes - 1, 1);
  const diasMes = new Date(anio, mes, 0).getDate();
  const [diario, eventos, inventario] = await Promise.all([todos('diario'), todos('eventos'), todos('inventario')]);
  const porFecha = new Map(diario.map((d) => [d.fecha, d]));
  const color = retoDelDia(fechaISO(primero), eventos).color;
  const hechos = diario.filter((d) => d.fecha.startsWith(`${anio}-${String(mes).padStart(2, '0')}`)).length;
  const otroMes = (n) => {
    const d = new Date(anio, mes - 1 + n, 1);
    return `#/calendario/${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };
  const retoHoy = retoDelDia(hoyISO, eventos);

  const celdas = [];
  const hueco = (primero.getDay() + 6) % 7;
  for (let i = 0; i < hueco; i++) celdas.push('<div class="cal-dia fuera" aria-hidden="true"></div>');
  for (let dia = 1; dia <= diasMes; dia++) {
    const iso = fechaISO(new Date(anio, mes - 1, dia));
    const reg = porFecha.get(iso);
    const futuro = iso > hoyISO;
    const r = retoDelDia(iso, eventos);
    const clases = ['cal-dia', futuro && 'futuro', iso === hoyISO && 'hoy', r.tematico && 'festivo'].filter(Boolean).join(' ');
    const contenido = reg
      ? `<img src="${urlDe(reg.mini)}" alt="Dibujo del ${dia}: ${esc(reg.palabra)}" loading="lazy">`
      : `<span class="pal">${futuro ? '' : esc(r.palabra)}</span>`;
    celdas.push(
      `<button class="${clases}" data-fecha="${iso}" ${futuro ? 'disabled' : ''} aria-label="${dia} de ${MESES[mes - 1]}${reg ? ', dibujado' : ''}">
        <span class="n">${dia}</span>${contenido}${r.tematico ? `<span class="tema" title="${esc(r.tematico)}">${r.tematico === '🎂' ? '🎂' : '🎉'}</span>` : ''}
      </button>`,
    );
  }

  el.innerHTML = `
    <div class="cal-cabecera">
      <div>
        <div class="cal-mes">
          <a class="btn chico" href="${otroMes(-1)}" aria-label="Mes anterior">←</a>
          <h1>${MESES[mes - 1]} ${anio}</h1>
          <a class="btn chico" href="${otroMes(1)}" aria-label="Mes siguiente">→</a>
        </div>
        <p class="muestra-color" style="margin:10px 0 0"><i style="background:${color.hex}"></i>Color del mes: ${esc(color.nombre)} · ${color.hex}</p>
        <p class="ayuda" style="margin:2px 0 0">Grafito + este único color. Estación: ${estacion(mes - 1)}.</p>
        <div style="max-width:420px"><div class="cal-progreso"><i style="width:${(hechos / diasMes) * 100}%"></i></div>
          <span class="ayuda">${hechos} de ${diasMes} días dibujados</span></div>
      </div>
      <section class="papel cinta reto-dia" style="max-width:340px">
        <h2 style="font-size:1.4rem">Palabra de hoy</h2>
        ${retoHoy.tematico ? `<p class="ayuda" style="margin:0">✨ ${esc(retoHoy.tematico)}</p>` : ''}
        <div class="palabra-grande">${esc(retoHoy.palabra)}</div>
        <p style="margin:0 0 12px">${esc(retoHoy.significado)}</p>
        <button class="btn ${porFecha.has(hoyISO) ? '' : 'primario'}" data-fecha="${hoyISO}">${porFecha.has(hoyISO) ? '✓ Ver mi dibujo de hoy' : 'Subir dibujo de hoy'}</button>
      </section>
    </div>
    <div class="cal-hoja cuadricula" style="box-shadow:var(--sombra)">
      <div class="cal-grid">${DIAS_SEM.map((d) => `<div class="cal-dsem">${d}</div>`).join('')}${celdas.join('')}</div>
    </div>
    <section class="papel" style="margin-top:24px">
      <h2>Mochila</h2>
      <p class="ayuda">Los premios de la ruleta se guardan aquí para el juego de granja.</p>
      <div class="mochila">${inventario.length ? inventario.filter((i) => i.cantidad > 0).map((i) => `<span>${esc(i.item)} × ${i.cantidad}</span>`).join('') : '<span>Vacía por ahora</span>'}</div>
    </section>`;

  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-fecha]');
    if (b && !b.disabled) abrirDia(b.dataset.fecha, porFecha.get(b.dataset.fecha), eventos, hoyISO);
  });
}

function abrirDia(iso, reg, eventos, hoyISO) {
  const r = reg ? { palabra: reg.palabra, significado: reg.significado, color: reg.color } : retoDelDia(iso, eventos);
  const cabecera = `
    <p class="ayuda" style="margin:0">${fechaBonita(iso)}</p>
    <div class="palabra-grande">${esc(r.palabra)}</div>
    <p>${esc(r.significado)}</p>
    <p class="muestra-color"><i style="background:${r.color.hex}"></i>${esc(r.color.nombre)} · ${r.color.hex}</p>`;

  if (reg) {
    const src = urlDe(reg.imagen);
    const d = modal(`
      ${cabecera}
      <img src="${src}" alt="Dibujo de ${esc(r.palabra)}" style="margin:12px auto;max-height:55dvh;cursor:zoom-in;border-radius:6px" data-zoom>
      ${reg.premio ? `<p>🎁 Premio: <strong>${esc(reg.premio.item)} × ${reg.premio.cantidad}</strong></p>` : ''}
      <div class="acciones">
        <button class="btn peligro chico" data-borrar>Borrar dibujo</button>
        ${iso === hoyISO && !reg.premio ? '<button class="btn primario chico" data-premio>Girar ruleta de premios 🎁</button>' : ''}
      </div>`);
    d.querySelector('[data-zoom]').onclick = () => visor(src, r.palabra);
    const btnPremio = d.querySelector('[data-premio]');
    if (btnPremio) btnPremio.onclick = () => (d.close(), ruletaPremio(iso));
    d.querySelector('[data-borrar]').onclick = async () => {
      if (!(await confirmar('¿Borrar el dibujo de este día? El premio que ganaste se queda en la mochila.'))) return;
      await borrar('diario', iso);
      d.close();
      recargar();
    };
    return;
  }

  const esHoy = iso === hoyISO;
  const d = modal(`
    ${cabecera}
    <form>
      <div class="campo"><label for="di">Tu dibujo</label><input id="di" type="file" name="imagen" accept="image/*" required></div>
      <label class="fila" style="margin-bottom:8px"><input type="checkbox" name="galeria"> Colgarlo también en la galería (sala “Retos”)</label>
      ${esHoy ? '<p class="ayuda">Al guardarlo podrás girar la ruleta de premios 🎁</p>' : '<p class="ayuda">Los días pasados se pueden completar, pero la ruleta de premios es solo para el dibujo del mismo día.</p>'}
      <div class="acciones"><button class="btn primario">Guardar dibujo</button></div>
    </form>`);
  d.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button.primario');
    btn.disabled = true;
    btn.textContent = 'Guardando…';
    const f = new FormData(e.target);
    const imagen = f.get('imagen');
    const mini = await miniatura(imagen, 300);
    const registro = { fecha: iso, imagen, mini, palabra: r.palabra, significado: r.significado, color: r.color, creado: Date.now(), premio: null };
    await guardar('diario', registro);
    if (f.get('galeria')) {
      await guardar('obras', {
        id: nuevoId(), titulo: r.palabra, fecha: iso, categoria: 'Retos', nota: `Reto diario: ${r.palabra}. Color: ${r.color.nombre} ${r.color.hex}`,
        favorito: false, marcoId: null, imagen, mini: await miniatura(imagen), creado: Date.now(),
      });
    }
    d.close();
    if (esHoy) ruletaPremio(iso);
    else {
      toast('Dibujo guardado ✏️');
      recargar();
    }
  });
}

// Ruleta de premios: un único premio aleatorio por el dibujo del día.
async function ruletaPremio(iso) {
  // Un solo premio por día, aunque se borre y se vuelva a subir el dibujo.
  const yaReclamado = await ajuste(`premio:${iso}`, null);
  if (yaReclamado) {
    const reg = await obtener('diario', iso);
    if (reg && !reg.premio) await guardar('diario', { ...reg, premio: yaReclamado });
    toast('El premio de hoy ya está en tu mochila 🎒');
    return recargar();
  }
  const segs = segmentosPremio(deISO(iso));
  const r = rueda(segs, { dona: false });
  let girada = false;
  const d = modal(
    `<h2 style="text-align:center">¡Dibujo del día listo! 🎉</h2>
     <p style="text-align:center">Gira la ruleta para ganar un premio para tu granja.</p>
     <div data-rueda></div>
     <p data-resultado style="text-align:center;font-size:1.2rem;min-height:1.6em;font-weight:700"></p>
     <button class="btn primario boton-girar" data-girar>Girar 🎁</button>`,
    { alCerrar: recargar },
  );
  d.querySelector('[data-rueda]').append(r.el);
  d.querySelector('[data-girar]').addEventListener('click', async (e) => {
    if (girada) return d.close();
    girada = true;
    e.target.disabled = true;
    const i = Math.floor(Math.random() * segs.length);
    const premio = segs[i].premio();
    // Se guarda antes de la animación para no perderlo si cierran la ventana.
    await guardarAjuste(`premio:${iso}`, premio);
    await sumarInventario(premio.item, premio.cantidad);
    const reg = await obtener('diario', iso);
    if (reg) await guardar('diario', { ...reg, premio });
    await r.girar(i);
    d.querySelector('[data-resultado]').textContent = `${segs[i].icono} Ganaste: ${premio.item} × ${premio.cantidad}`;
    celebrar();
    e.target.disabled = false;
    e.target.textContent = '¡Genial! Cerrar';
  });
}
