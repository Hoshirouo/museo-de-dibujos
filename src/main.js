import './styles.css';
import { nuevoLote, transicion } from './ui.js';
import { pedirPersistencia } from './db.js';
import museo from './views/museo.js';
import galeria from './views/galeria.js';
import bocetos from './views/bocetos.js';
import calendario from './views/calendario.js';
import ruleta from './views/ruleta.js';
import metas from './views/metas.js';
import ajustes from './views/ajustes.js';

const RUTAS = { '': museo, galeria, bocetos, calendario, ruleta, metas, ajustes };
const app = document.getElementById('app');

// Cada vista es una función async (contenedor, parámetros) que llena el contenedor.
// Pueden volver a llamar a `recargar()` para redibujarse tras guardar algo.
async function navegar(mismaPantalla = false) {
  // #/galeria/Bocetos → ruta "galeria", parámetros ["Bocetos"]
  const [ruta = '', ...params] = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  const vista = RUTAS[ruta] || museo;
  document.querySelectorAll('.nav a').forEach((a) => a.classList.toggle('activa', a.dataset.ruta === ruta));
  document.body.dataset.ruta = ruta || 'museo';
  const liberarAnterior = nuevoLote();
  const contenido = document.createElement('div');
  contenido.className = `vista vista-${ruta || 'museo'}`;
  await vista(contenido, params);
  if (mismaPantalla || !app.childElementCount) {
    app.replaceChildren(contenido);
  } else {
    await transicion(() => {
      app.replaceChildren(contenido);
      window.scrollTo(0, 0);
    });
  }
  liberarAnterior();
}

// Redibuja la pantalla actual (tras guardar algo) sin animación ni subir el scroll.
export const recargar = () => navegar(true);

window.addEventListener('hashchange', () => navegar());
navegar();
pedirPersistencia();
