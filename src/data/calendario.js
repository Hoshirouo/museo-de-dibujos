// Reto diario: una palabra por día y un color base por mes (cada mes ~30 días).
// La lista la preparó una IA; rota cada día de forma fija, así la palabra
// es la misma en la PC y en la tablet sin necesitar internet.
import { deISO } from '../ui.js';

export const PALABRAS = [
  ['Refugio', 'Lugar donde uno se siente a salvo.'],
  ['Nostalgia', 'Tristeza dulce al recordar algo que ya pasó.'],
  ['Brújula', 'Instrumento que siempre apunta al norte.'],
  ['Eclipse', 'Cuando un astro tapa la luz de otro.'],
  ['Cosecha', 'Recoger los frutos de lo que se sembró.'],
  ['Susurro', 'Hablar muy bajito, casi sin voz.'],
  ['Laberinto', 'Lugar de caminos enredados del que cuesta salir.'],
  ['Farol', 'Lámpara que alumbra calles y caminos.'],
  ['Marea', 'Subida y bajada del mar.'],
  ['Semilla', 'El inicio pequeñito de una planta.'],
  ['Viajero', 'Quien va de un lugar a otro.'],
  ['Telaraña', 'Red que teje la araña.'],
  ['Abrazo', 'Rodear a alguien con los brazos con cariño.'],
  ['Niebla', 'Nube baja que no deja ver lejos.'],
  ['Tesoro', 'Algo muy valioso, escondido o guardado.'],
  ['Hechizo', 'Encantamiento mágico.'],
  ['Pluma', 'Lo que cubre a las aves; también para escribir.'],
  ['Ventana', 'Abertura para mirar afuera.'],
  ['Raíz', 'Parte de la planta bajo tierra; también el origen de algo.'],
  ['Cometa', 'Astro con cola brillante, o juguete que vuela con el viento.'],
  ['Despertar', 'Dejar de dormir; darse cuenta de algo.'],
  ['Melodía', 'Sucesión de sonidos que forman una canción.'],
  ['Guardián', 'Quien cuida y protege algo.'],
  ['Espejo', 'Superficie que refleja.'],
  ['Té', 'Bebida caliente de hojas; momento para descansar.'],
  ['Tormenta', 'Lluvia fuerte con viento y truenos.'],
  ['Carta', 'Mensaje escrito para alguien.'],
  ['Luciérnaga', 'Insecto que brilla en la oscuridad.'],
  ['Puente', 'Lo que une dos orillas.'],
  ['Sombra', 'Zona oscura que deja algo al tapar la luz.'],
  ['Fiesta', 'Celebración con alegría.'],
  ['Huella', 'Marca que deja un paso o un recuerdo.'],
  ['Montaña', 'Gran elevación de tierra.'],
  ['Reloj', 'Lo que mide el tiempo.'],
  ['Musgo', 'Plantita verde y suave que crece en la humedad.'],
  ['Pez', 'Animal que vive en el agua.'],
  ['Llave', 'Lo que abre puertas y secretos.'],
  ['Disfraz', 'Ropa para parecer otra persona o cosa.'],
  ['Galaxia', 'Enorme grupo de estrellas.'],
  ['Mercado', 'Lugar de puestos donde se compra y se vende.'],
  ['Calma', 'Tranquilidad, sin prisa ni ruido.'],
  ['Vapor', 'Agua convertida en nube caliente.'],
  ['Corona', 'Adorno de la realeza en la cabeza.'],
  ['Mapa', 'Dibujo de un lugar para no perderse.'],
  ['Caracol', 'Animal lento que lleva su casa encima.'],
  ['Atardecer', 'Momento en que el sol se esconde.'],
  ['Fantasma', 'Espíritu que, dicen, aparece de noche.'],
  ['Jardín', 'Lugar con plantas y flores cuidadas.'],
  ['Nido', 'Casa que hacen las aves para sus crías.'],
  ['Vela', 'Cera con mecha que da luz; o tela de un barco.'],
  ['Rugido', 'Sonido fuerte de un león u otra fiera.'],
  ['Burbuja', 'Esfera de aire envuelta en líquido.'],
  ['Escalera', 'Peldaños para subir o bajar.'],
  ['Picnic', 'Comida al aire libre sobre una manta.'],
  ['Ancla', 'Pieza pesada que sujeta al barco.'],
  ['Sueño', 'Lo que imaginamos al dormir, o un deseo.'],
  ['Cristal', 'Material transparente y frágil.'],
  ['Lluvia', 'Agua que cae de las nubes.'],
  ['Antifaz', 'Máscara que cubre los ojos.'],
  ['Dragón', 'Criatura legendaria con alas que escupe fuego.'],
  ['Panadería', 'Tienda donde se hornea pan.'],
  ['Eco', 'Sonido que regresa al rebotar.'],
  ['Girasol', 'Flor que sigue al sol.'],
  ['Brillo', 'Luz que algo refleja o emite.'],
  ['Valiente', 'Quien enfrenta el miedo.'],
  ['Cueva', 'Hueco grande en la roca.'],
  ['Pastel', 'Torta dulce para celebrar.'],
  ['Hilo', 'Fibra delgada para coser.'],
  ['Isla', 'Tierra rodeada de agua.'],
  ['Remolino', 'Giro rápido de agua o viento.'],
  ['Gato', 'Felino doméstico, curioso y dormilón.'],
  ['Pergamino', 'Papel antiguo enrollado.'],
  ['Invierno', 'La estación más fría del año.'],
  ['Ola', 'Movimiento del mar que llega a la orilla.'],
  ['Pócima', 'Bebida mágica o medicinal.'],
  ['Andén', 'Lugar donde se espera el tren.'],
  ['Cielo', 'Lo que vemos sobre nosotros.'],
  ['Florero', 'Recipiente para poner flores.'],
  ['Silencio', 'Ausencia de ruido.'],
  ['Robot', 'Máquina que actúa sola.'],
  ['Cascada', 'Agua que cae desde lo alto.'],
  ['Secreto', 'Algo que se guarda sin contar.'],
  ['Ovillo', 'Bola de lana enrollada.'],
  ['Volcán', 'Montaña que puede expulsar lava.'],
  ['Domingo', 'Día de descanso.'],
  ['Amuleto', 'Objeto que, se cree, trae suerte.'],
  ['Pájaro', 'Ave pequeña que canta.'],
  ['Desierto', 'Lugar seco con mucha arena.'],
  ['Cuento', 'Historia corta, a veces mágica.'],
  ['Estrella', 'Punto de luz en el cielo nocturno.'],
  ['Herida', 'Daño en la piel, o algo que duele por dentro.'],
  ['Bosque', 'Lugar con muchos árboles.'],
  ['Columpio', 'Asiento colgado que se mece.'],
  ['Máscara', 'Lo que cubre la cara.'],
  ['Hongo', 'Ser que crece en la humedad; algunos parecen sombrillas.'],
  ['Paraguas', 'Lo que nos protege de la lluvia.'],
  ['Reflejo', 'Imagen que devuelve el agua o un espejo.'],
  ['Mudanza', 'Cambiar de casa.'],
  ['Luna', 'Satélite que ilumina la noche.'],
  ['Alas', 'Lo que permite volar.'],
  ['Acuario', 'Pecera grande con vida marina.'],
  ['Ruinas', 'Restos de una construcción antigua.'],
  ['Abuela', 'La mamá de mamá o de papá.'],
  ['Arcoíris', 'Arco de colores después de la lluvia.'],
  ['Tejer', 'Entrelazar hilos para crear tela.'],
  ['Frontera', 'Límite entre dos lugares.'],
  ['Tren', 'Vehículo de vagones sobre rieles.'],
  ['Oso', 'Animal grande y peludo.'],
  ['Campana', 'Instrumento que suena al golpearlo.'],
  ['Origami', 'Arte de doblar papel.'],
  ['Sirena', 'Ser mitad mujer, mitad pez.'],
  ['Mañana', 'Primeras horas del día; también el día siguiente.'],
  ['Cactus', 'Planta con espinas que guarda agua.'],
  ['Tinta', 'Líquido de color para escribir o dibujar.'],
  ['Caos', 'Desorden total.'],
  ['Balcón', 'Saliente de una casa para asomarse.'],
  ['Pingüino', 'Ave que no vuela y nada en aguas frías.'],
  ['Granja', 'Lugar con cultivos y animales.'],
  ['Melancolía', 'Tristeza suave y tranquila.'],
  ['Hogar', 'El lugar donde perteneces.'],
];

// Un color base por mes (índice 0 = enero).
export const COLORES_MES = [
  { nombre: 'Rojo amapola', hex: '#D9534F' },
  { nombre: 'Rosa chicle', hex: '#E68FAC' },
  { nombre: 'Naranja mandarina', hex: '#F08A3C' },
  { nombre: 'Ocre otoñal', hex: '#C98A2E' },
  { nombre: 'Verde oliva', hex: '#7D8F3A' },
  { nombre: 'Azul invierno', hex: '#4F7CAC' },
  { nombre: 'Rojo bandera', hex: '#C8102E' },
  { nombre: 'Lila', hex: '#9B7EC8' },
  { nombre: 'Verde primavera', hex: '#5DAE6B' },
  { nombre: 'Turquesa', hex: '#2BA6A0' },
  { nombre: 'Morado nazareno', hex: '#6B3FA0' },
  { nombre: 'Verde pino', hex: '#2E6B4F' },
];

// Domingo de Pascua (algoritmo de Gauss/Meeus).
function pascua(anio) {
  const a = anio % 19, b = Math.floor(anio / 100), c = anio % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(anio, mes - 1, dia);
}

// Feriados de Perú con su palabra temática.
const FERIADOS_FIJOS = {
  '01-01': ['Año Nuevo', 'Comienzo', 'Lo primero de algo nuevo.'],
  '05-01': ['Día del Trabajo', 'Oficio', 'El trabajo que alguien hace con sus manos.'],
  '06-07': ['Día de la Bandera', 'Bandera', 'Tela con los colores de un país.'],
  '06-29': ['San Pedro y San Pablo', 'Pescador', 'Quien vive de lo que da el mar.'],
  '07-23': ['Día de la Fuerza Aérea', 'Vuelo', 'Moverse por el aire.'],
  '07-28': ['Fiestas Patrias', 'Patria', 'La tierra a la que uno pertenece.'],
  '07-29': ['Fiestas Patrias', 'Desfile', 'Gente marchando en fila para celebrar.'],
  '08-06': ['Batalla de Junín', 'Caballo', 'Animal veloz y noble.'],
  '08-30': ['Santa Rosa de Lima', 'Rosa', 'Flor con espinas y perfume.'],
  '10-08': ['Combate de Angamos', 'Barco', 'Nave que cruza el mar.'],
  '11-01': ['Todos los Santos', 'Recuerdo', 'Lo que guardamos en la memoria.'],
  '12-08': ['Inmaculada Concepción', 'Luz', 'Lo que permite ver.'],
  '12-09': ['Batalla de Ayacucho', 'Libertad', 'Poder elegir tu propio camino.'],
  '12-25': ['Navidad', 'Regalo', 'Algo que se da con cariño.'],
};

export function feriado(iso) {
  const fijo = FERIADOS_FIJOS[iso.slice(5)];
  if (fijo) return { nombre: fijo[0], palabra: fijo[1], significado: fijo[2] };
  const d = deISO(iso);
  const p = pascua(d.getFullYear());
  const dif = Math.round((d - p) / 864e5);
  if (dif === -3) return { nombre: 'Jueves Santo', palabra: 'Pan', significado: 'Alimento que se comparte.' };
  if (dif === -2) return { nombre: 'Viernes Santo', palabra: 'Silencio', significado: 'Ausencia de ruido; momento de reflexión.' };
  return null;
}

const diaDelAnio = (d) => Math.round((d - new Date(d.getFullYear(), 0, 1)) / 864e5);

// Palabra y color de un día. Los cumpleaños registrados tienen prioridad.
export function retoDelDia(iso, eventos = []) {
  const d = deISO(iso);
  const color = COLORES_MES[d.getMonth()];
  const cumple = eventos.find((e) => e.fecha === iso.slice(5));
  if (cumple) {
    return { palabra: `Cumpleaños de ${cumple.nombre}`, significado: 'Hoy toca un dibujo especial para celebrar.', color, tematico: '🎂' };
  }
  const f = feriado(iso);
  if (f) return { palabra: f.palabra, significado: f.significado, color, tematico: f.nombre };
  // Desplazamiento por año para que no se repita igual cada año.
  const i = (diaDelAnio(d) + d.getFullYear() * 7) % PALABRAS.length;
  const [palabra, significado] = PALABRAS[i];
  return { palabra, significado, color, tematico: null };
}
