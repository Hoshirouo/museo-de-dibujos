// Premios de la ruleta diaria. Se guardan en la mochila para usarlos
// cuando exista el juego de granja (segunda fase).

// Estaciones de Perú (hemisferio sur).
export function estacion(mes) {
  if (mes === 11 || mes <= 1) return 'Verano';
  if (mes <= 4) return 'Otoño';
  if (mes <= 7) return 'Invierno';
  return 'Primavera';
}

export const CULTIVOS = {
  Verano: ['Sandía', 'Melón', 'Pepino', 'Ají amarillo', 'Pimiento', 'Berenjena', 'Zapallito italiano'],
  Otoño: ['Zanahoria', 'Brócoli', 'Coliflor', 'Espinaca', 'Lechuga', 'Arveja', 'Betarraga'],
  Invierno: ['Ajo', 'Cebolla', 'Apio', 'Perejil', 'Culantro', 'Rabanito', 'Acelga'],
  Primavera: ['Tomate', 'Vainita', 'Maíz', 'Zapallo', 'Albahaca', 'Tomate cherry', 'Caigua'],
};

const ROPA = { Verano: 'Sombrero de paja', Otoño: 'Chompa de lana', Invierno: 'Chullo', Primavera: 'Vestido de flores' };
const MUEBLE = { Verano: 'Silla de playa', Otoño: 'Alfombra de hojas', Invierno: 'Chimenea pequeña', Primavera: 'Maceta colgante' };

const azar = (lista) => lista[Math.floor(Math.random() * lista.length)];

// Segmentos de la ruleta para una fecha. Cada uno sabe generar su premio.
export function segmentosPremio(fecha) {
  const est = estacion(fecha.getMonth());
  return [
    { etiqueta: '5 plátanos', icono: '🍌', premio: () => ({ item: 'Plátano', cantidad: 5 }) },
    { etiqueta: 'Semillas', icono: '🌱', premio: () => ({ item: `Semillas de ${azar(CULTIVOS[est]).toLowerCase()}`, cantidad: 5 }) },
    { etiqueta: 'Ropa', icono: '👒', premio: () => ({ item: ROPA[est], cantidad: 1 }) },
    { etiqueta: '3 huevos', icono: '🥚', premio: () => ({ item: 'Huevo', cantidad: 3 }) },
    { etiqueta: 'Mueble', icono: '🪑', premio: () => ({ item: MUEBLE[est], cantidad: 1 }) },
    { etiqueta: 'Semillas x2', icono: '🌿', premio: () => ({ item: `Semillas de ${azar(CULTIVOS[est]).toLowerCase()}`, cantidad: 10 }) },
    { etiqueta: 'Fertilizante', icono: '🧺', premio: () => ({ item: 'Fertilizante', cantidad: 3 }) },
    { etiqueta: '20 monedas', icono: '🪙', premio: () => ({ item: 'Monedas', cantidad: 20 }) },
  ];
}
