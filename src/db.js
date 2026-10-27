// Capa de datos. Toda la web lee y escribe solo a través de este módulo,
// así que pasar a la nube (Supabase, Firebase...) en el futuro significa
// reescribir este archivo y nada más.
import { openDB } from 'idb';

const DB_NOMBRE = 'museo-dibujos';
const VERSION = 1;

export const TIENDAS = ['obras', 'marcos', 'cuadernos', 'paginas', 'diario', 'metas', 'inventario', 'eventos', 'ajustes'];

const dbPromesa = openDB(DB_NOMBRE, VERSION, {
  upgrade(db) {
    const obras = db.createObjectStore('obras', { keyPath: 'id' });
    obras.createIndex('fecha', 'fecha');
    db.createObjectStore('marcos', { keyPath: 'id' });
    db.createObjectStore('cuadernos', { keyPath: 'id' });
    const paginas = db.createObjectStore('paginas', { keyPath: 'id' });
    paginas.createIndex('cuaderno', 'cuadernoId');
    db.createObjectStore('diario', { keyPath: 'fecha' });
    const metas = db.createObjectStore('metas', { keyPath: 'id' });
    metas.createIndex('semana', 'semana');
    db.createObjectStore('inventario', { keyPath: 'item' });
    db.createObjectStore('eventos', { keyPath: 'id' });
    db.createObjectStore('ajustes');
  },
});

export const nuevoId = () => crypto.randomUUID();

export async function todos(tienda) {
  return (await dbPromesa).getAll(tienda);
}

export async function porIndice(tienda, indice, valor) {
  return (await dbPromesa).getAllFromIndex(tienda, indice, valor);
}

export async function obtener(tienda, clave) {
  return (await dbPromesa).get(tienda, clave);
}

export async function guardar(tienda, valor) {
  return (await dbPromesa).put(tienda, valor);
}

export async function borrar(tienda, clave) {
  return (await dbPromesa).delete(tienda, clave);
}

export async function ajuste(clave, porDefecto) {
  const v = await (await dbPromesa).get('ajustes', clave);
  return v === undefined ? porDefecto : v;
}

export async function guardarAjuste(clave, valor) {
  return (await dbPromesa).put('ajustes', valor, clave);
}

export async function sumarInventario(item, cantidad) {
  const db = await dbPromesa;
  const actual = (await db.get('inventario', item)) || { item, cantidad: 0 };
  actual.cantidad += cantidad;
  return db.put('inventario', actual);
}

export async function borrarCuaderno(id) {
  const db = await dbPromesa;
  const tx = db.transaction(['cuadernos', 'paginas'], 'readwrite');
  const paginas = await tx.objectStore('paginas').index('cuaderno').getAllKeys(id);
  await Promise.all([...paginas.map((k) => tx.objectStore('paginas').delete(k)), tx.objectStore('cuadernos').delete(id), tx.done]);
}

// Copia de seguridad: un .zip con data.json y las imágenes como archivos.
export async function exportarTodo() {
  const { zipSync, strToU8 } = await import('fflate');
  const db = await dbPromesa;
  const archivos = {};
  const datos = {};
  let n = 0;
  for (const tienda of TIENDAS) {
    if (tienda === 'ajustes') {
      const claves = await db.getAllKeys('ajustes');
      const valores = await db.getAll('ajustes');
      datos.ajustes = await Promise.all(claves.map(async (k, i) => ({ k, v: await serializar(valores[i]) })));
      continue;
    }
    datos[tienda] = await Promise.all((await db.getAll(tienda)).map(serializar));
  }
  archivos['data.json'] = strToU8(JSON.stringify({ version: VERSION, datos }));
  return new Blob([zipSync(archivos, { level: 0 })], { type: 'application/zip' });

  async function serializar(valor) {
    if (valor instanceof Blob) {
      const nombre = `img/${n++}`;
      archivos[nombre] = new Uint8Array(await valor.arrayBuffer());
      return { __blob: nombre, type: valor.type };
    }
    if (Array.isArray(valor)) return Promise.all(valor.map(serializar));
    if (valor && typeof valor === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(valor)) out[k] = await serializar(v);
      return out;
    }
    return valor;
  }
}

export async function importarTodo(archivoZip) {
  const { unzipSync, strFromU8 } = await import('fflate');
  const archivos = unzipSync(new Uint8Array(await archivoZip.arrayBuffer()));
  if (!archivos['data.json']) throw new Error('El archivo no es una copia de seguridad válida.');
  const { datos } = JSON.parse(strFromU8(archivos['data.json']));
  const revivir = (valor) => {
    if (Array.isArray(valor)) return valor.map(revivir);
    if (valor && typeof valor === 'object') {
      if (valor.__blob) return new Blob([archivos[valor.__blob]], { type: valor.type });
      return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, revivir(v)]));
    }
    return valor;
  };
  const db = await dbPromesa;
  const tx = db.transaction(TIENDAS, 'readwrite');
  for (const tienda of TIENDAS) {
    const store = tx.objectStore(tienda);
    await store.clear();
    for (const fila of datos[tienda] || []) {
      if (tienda === 'ajustes') await store.put(revivir(fila.v), fila.k);
      else await store.put(revivir(fila));
    }
  }
  await tx.done;
}

// Pide al navegador que no borre los datos aunque falte espacio.
export async function pedirPersistencia() {
  if (navigator.storage?.persist) return navigator.storage.persist();
  return false;
}
