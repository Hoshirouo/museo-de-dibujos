// Temas de color predeterminados. Los colores viven en styles.css
// ([data-tema="..."]); aquí solo están los nombres y la muestra del selector.
export const TEMAS = [
  { id: 'salvia', nombre: 'Cuaderno salvia', muestra: ['#d4dec6', '#fffdf6', '#f0a39a', '#2b3a6b'] },
  { id: 'matcha', nombre: 'Matcha', muestra: ['#9fae6a', '#f3f0dc', '#4e6b2e', '#e7a8a0'] },
  { id: 'cielo', nombre: 'Cielo', muestra: ['#e8f1fa', '#ffffff', '#7fa6cf', '#2f4d6e'] },
  { id: 'fresa', nombre: 'Fresa', muestra: ['#f8e1e7', '#fffafb', '#e88fae', '#6b3550'] },
  { id: 'noche', nombre: 'Noche estrellada', muestra: ['#1d2232', '#2a3145', '#c3a6f0', '#e8e6f2'] },
];

const COLOR_BARRA = { salvia: '#d4dec6', matcha: '#9fae6a', cielo: '#e8f1fa', fresa: '#f8e1e7', noche: '#1d2232' };

export function temaActual() {
  return document.documentElement.dataset.tema || 'salvia';
}

// Botones para elegir tema; se usan en el modal 🎨 y en Ajustes.
export function selectorTemas() {
  const el = document.createElement('div');
  el.className = 'temas';
  const pintar = () => {
    el.innerHTML = TEMAS.map(
      (t) => `<button class="tema-opcion" data-tema="${t.id}" aria-pressed="${t.id === temaActual()}">
        <span class="tema-muestra">${t.muestra.map((c) => `<i style="background:${c}"></i>`).join('')}</span>${t.nombre}</button>`,
    ).join('');
  };
  pintar();
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tema]');
    if (!b) return;
    aplicarTema(b.dataset.tema);
    pintar();
  });
  return el;
}

// El tema es una preferencia de cada dispositivo, por eso va en localStorage.
export function aplicarTema(id) {
  if (!COLOR_BARRA[id]) id = 'salvia';
  document.documentElement.dataset.tema = id;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLOR_BARRA[id]);
  try {
    localStorage.setItem('tema', id);
  } catch {}
}
