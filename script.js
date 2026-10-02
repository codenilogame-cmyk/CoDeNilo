/* ==========================================================================
   CoDeNilo - script.js
   Partes:  1 Datos · 2 Estado · 3 Audio · 4 Intérprete · 5 Dibujo · 6 Juego · 7 Jefe · 8 Interfaz
   ========================================================================== */
'use strict';
const $ = id => document.getElementById(id);
const TILE = 40, COLS = 12, FILAS = 8, DX = [1, 0, -1, 0], DY = [0, 1, 0, -1]; // dir: 0 der,1 abajo,2 izq,3 arriba
const CMD = ['avanzar', 'izquierda', 'derecha', 'construir_puente', 'linterna', 'camino_libre', 'esquivar_izquierda', 'esquivar_derecha', 'disparar'];
const LANE = [100, 240, 380], ATQ = { izquierda: 0, centro: 1, derecha: 2 };

/* ===== 1. DATOS: la guía y los niveles (para agregar un nivel solo se edita esta sección) ===== */
const GUIA = [
 ['reglas', 'Las reglas del código', `<p>Escribir código es dar <b>órdenes</b> a Nilo, una por línea. Mira esta orden:</p><pre>avanzar();</pre>
  <ul><li><b>avanzar</b>: el nombre de la orden. Debe escribirse igualito, sin faltas (avansar no existe).</li>
  <li><b>( )</b> los paréntesis: son por donde Nilo "escucha" la orden. Siempre van juntos.</li>
  <li><b>;</b> el punto y coma: es el punto final de la orden. Dice "¡terminé!".</li></ul>
  <p>Nilo lee <b>de arriba hacia abajo</b>, una orden a la vez, en el orden que las escribiste. Como una receta de cocina.</p>`],
 ['secuencias', 'Secuencias', `<p>Una <b>secuencia</b> son varias órdenes seguidas. El orden importa: no es lo mismo "ponerse las botas y luego caminar" que "caminar y luego ponerse las botas".</p>
  <pre>avanzar();\navanzar();\nderecha();\navanzar();</pre><p>Nilo da dos pasos, gira a la derecha y da un paso más.</p>`],
 ['variables', 'Variables', `<p>Una <b>variable</b> es como un bolsillo de la mochila de Nilo con una etiqueta: guarda un dato o un objeto.</p>
  <pre>troncos = 3;\nbateria = 10;</pre><p>Primero va el nombre del bolsillo, luego <code>=</code> y lo que guardas. Más tarde puedes mirar o cambiar lo que hay adentro.</p>`],
 ['operadores', 'Operadores', `<p>Son los signos para hacer cuentas, como en la tienda:</p>
  <ul><li><code>+</code> suma: tenías 2 troncos y encuentras 1 → <code>troncos += 1;</code></li>
  <li><code>-</code> resta: gastas 1 de batería → <code>bateria -= 1;</code></li>
  <li><code>==</code> pregunta "¿son iguales?" · <code>&lt;</code> "¿es menor?" · <code>&gt;</code> "¿es mayor?"</li></ul>`],
 ['condicionales', 'Condicionales (si / sino)', `<p>Una <b>condición</b> deja que Nilo decida, como tú: <i>"si llueve, llevo paraguas; si no, no".</i></p>
  <pre>si (camino_libre()) {\n  avanzar();\n} sino {\n  derecha();\n}</pre>
  <p>Si el camino está libre, avanza. Si no, gira. Lo que va entre llaves <code>{ }</code> es lo que se hace en cada caso.</p>`],
 ['bucles', 'Bucles (repetir)', `<p>Un <b>bucle</b> repite una acción. Como cuando dices "dale 10 vueltas a la plaza" en vez de decir "una vuelta" diez veces.</p>
  <pre>repetir(5) {\n  avanzar();\n}</pre><p>Es lo mismo que escribir avanzar(); cinco veces, pero más corto.</p>`],
 ['funciones', 'Funciones', `<p>Una <b>función</b> es una receta con nombre: agrupas varias órdenes y las usas cuando quieras.</p>
  <pre>funcion escalon() {\n  avanzar();\n  izquierda();\n  avanzar();\n  derecha();\n}\nescalon();\nescalon();</pre><p>Primero la creas (con llaves), después la llamas por su nombre.</p>`],
 ['optimizacion', 'Optimización', `<p>Hay muchas formas de resolver algo, pero <b>una puede ser mejor</b>: más corta y fácil de leer. Escribir avanzar(); 20 veces funciona, pero <code>repetir(20)</code> hace lo mismo con menos esfuerzo. ¡Por eso da más puntos!</p>`]
];
const G_ = k => GUIA.find(g => g[0] === k);
const R0 = ['avanzar', 'izquierda', 'derecha'];
// Cada nivel: mapa (# bloqueado, ~ agua, ^ pozo oculto, S inicio, G meta), decor, comandos permitidos, ayuda, etc.
const NIVELES = [
 { id: 0, nombre: 'Tutorial · Despierta, Nilo', icono: '📖', escenario: 'campamento', pos: [8, 78], tema: 'reglas',
   historia: ['¡Hola! Soy Nilo. Desperté en un campamento y no recuerdo cómo llegué. ¡Tú me vas a ayudar!',
     'Yo no entiendo palabras sueltas: obedezco ÓRDENES escritas. A esas órdenes se les llama CÓDIGO. Tú las escribes en el cuadro oscuro de abajo: el editor.',
     'Cada orden se escribe así:  avanzar();\nLa palabra dice QUÉ hacer, los paréntesis ( ) son por donde me llega la orden, y el punto y coma ; avisa que la orden terminó. Si falta algo, ¡me confundo!',
     'Leo de arriba hacia abajo, una orden por línea. Cuando termines pulsa ▶ EJECUTAR y me verás caminar. Si algo sale mal, ↻ REINICIAR y probamos otra vez. ¡Vamos!'],
   descripcion: 'Aprende lo básico: dónde escribir y cómo se escribe una orden.', objetivo: 'Escribe avanzar(); cuatro veces (una por línea) para llegar a la bandera.',
   comandos: R0, permite: [], inicio: { x: 1, y: 4, dir: 0 }, optimo: null, recompensa: [],
   explica: '<b>Ejemplo:</b><pre>avanzar();\navanzar();</pre>Nilo da 2 pasos hacia donde mira. Para girar usa <code>derecha();</code> o <code>izquierda();</code>.',
   pista: 'Escribe avanzar(); en 4 líneas distintas. No olvides los paréntesis ni el punto y coma.',
   decor: [['fogata', 3, 2], ['tienda', 9, 1]],
   mapa: ['#..#...#...#', '............', '..#......#..', '............', '.S...G......', '............', '#...#....#..', '..#.......#.'] },
 { id: 1, nombre: 'El campamento', icono: '🏕️', escenario: 'campamento', pos: [22, 56], tema: 'secuencias',
   historia: ['Ya recuerdo: salí a explorar esta región misteriosa. El sendero empieza al otro lado del campamento.', 'Ahora combina pasos y giros. Recuerda: después de girar, avanzar va en la nueva dirección.'],
   descripcion: 'Lleva a Nilo hasta el comienzo del sendero.', objetivo: 'Llega a la bandera: 4 pasos a la derecha, gira a la izquierda y 3 pasos más.',
   comandos: R0, permite: [], inicio: { x: 1, y: 5, dir: 0 }, optimo: 8, recompensa: ['🧭 Brújula'],
   explica: '<b>Comandos:</b> <code>avanzar();</code> da un paso · <code>izquierda();</code> gira a la izquierda · <code>derecha();</code> gira a la derecha.<pre>avanzar();\nderecha();\navanzar();</pre>Giras primero y después avanzas hacia donde miras.',
   pista: 'Nilo mira a la derecha. Avanza 4 veces, usa izquierda(); (queda mirando arriba) y avanza 3 veces.',
   decor: [['tienda', 7, 5], ['fogata', 2, 6], ['mochila', 2, 4], ['persona', 9, 6, 0], ['persona', 10, 2, 1]],
   mapa: ['#.#.....#..#', '....#....#..', '.#...G..#...', '....#.......', '..#......#..', '.S......#...', '....#.......', '#.....#....#'] },
 { id: 2, nombre: 'El río', icono: '🌊', escenario: 'rio', pos: [36, 76], tema: 'variables',
   historia: ['¡Un río! Hay troncos por todos lados, pero solo necesitamos 3 para el puente.', '"Parece que Nilo necesita troncos para construir el puente." Guarda 3 en tu mochila con una variable: troncos = 3;'],
   descripcion: 'Construye un puente con 3 troncos.', objetivo: 'Guarda 3 troncos, camina hasta la orilla, usa construir_puente(); y cruza hasta la bandera.',
   comandos: [...R0, 'construir_puente'], permite: ['variables'], inicio: { x: 1, y: 4, dir: 0 }, optimo: 10, recompensa: ['🪵 Troncos'],
   explica: '<b>Nuevo:</b> <code>troncos = 3;</code> crea la variable (un bolsillo de la mochila) con 3 troncos. <code>construir_puente();</code> usa los troncos y tiende el puente frente a Nilo.',
   pista: 'troncos = 3; · avanza 3 veces hasta la orilla · construir_puente(); · avanza 5 veces.',
   decor: [['tronco', 2, 2], ['tronco', 3, 6], ['tronco', 9, 1], ['tronco', 8, 6], ['tronco', 10, 3], ['roca', 2, 5], ['roca', 9, 7]],
   mapa: ['#..#.~~~..#.', '.....~~~.#..', '.#...~~~....', '.....~~~....', '.S...~~~.G..', '.....~~~....', '...#.~~~.#..', '#....~~~...#'] },
 { id: 3, nombre: 'La noche', icono: '🌙', escenario: 'noche', pos: [48, 50], tema: 'operadores',
   historia: ['Se hizo de noche y me perdí. Tengo una linterna, pero su batería es limitada: bateria = 10.', 'Cada vez que uso la linterna el juego hace bateria -= 1; (restar 1). ¡Úsala con cabeza! Hay pozos que solo se ven con luz.'],
   descripcion: 'Cruza el bosque nocturno sin caer en los pozos.', objetivo: 'Usa linterna(); para ver los pozos y llega a la bandera.',
   comandos: [...R0, 'linterna'], permite: ['variables', 'repetir'], vars: { bateria: 10 }, inicio: { x: 0, y: 6, dir: 0 }, optimo: null, recompensa: ['🔦 Linterna', '🗺️ Mapa'],
   pista: 'Ejecuta primero solo linterna(); y observa dónde están los pozos. Luego planea tu camino.',
   decor: [], mapa: ['############', '#...^...^..G', '............', '.#..^.^.^...', '..^.........', '.....^.#....', 'S...^^^.....', '.^^.#...#...'] },
 { id: 4, nombre: 'La cueva', icono: '🪨', escenario: 'cueva', pos: [62, 74], tema: 'bucles',
   historia: ['Una cueva con cristales que brillan. El camino es largo y recto. ¡Escribir tantos pasos cansa!', 'Un bucle repite una acción: es como decir "da 10 vueltas" en lugar de decir "una vuelta" diez veces.'],
   descripcion: 'Recorre el laberinto de cristales.', objetivo: 'Llega a la bandera. ¿Puedes hacerlo con bucles?',
   comandos: R0, permite: ['repetir', 'variables'], inicio: { x: 1, y: 1, dir: 0 }, optimo: 8, recompensa: ['💎 Cristales'],
   pista: 'repetir(9) { avanzar(); } sirve para cada tramo recto.', decor: [],
   mapa: ['############', '#S.........#', '##########.#', '##########.#', '##########.#', '##########.#', '#G.........#', '############'] },
 { id: 5, nombre: 'La montaña', icono: '⛰️', escenario: 'montana', pos: [80, 44], tema: 'bucles',
   historia: ['Salimos de la cueva y ahí está la montaña. El viento sopla fuerte. Hay que subir por escalones.', 'Aquí tienes que acordarte solo de lo aprendido: secuencias, variables, condiciones y bucles.'],
   descripcion: 'Sube por la montaña.', objetivo: 'Sube hasta la bandera por el sendero en zigzag.',
   comandos: R0, permite: ['repetir', 'variables', 'si', 'sino'], inicio: { x: 0, y: 7, dir: 0 }, optimo: 9, recompensa: ['🪨 Piedras'], pista: null, decor: [],
   mapa: ['############', '######G#####', '######.#####', '####...#####', '####.#######', '##...#######', '##.#########', 'S..#########'] },
 { id: 6, nombre: 'El mirador', icono: '🌅', escenario: 'mirador', pos: [66, 16], tema: 'funciones',
   historia: ['¡Qué vista! Hay un cofre al final de esta escalera de piedra. Cada escalón es igual: avanzar, subir, avanzar, girar.', 'En vez de repetir las 4 órdenes una y otra vez, ¡dales un nombre! Eso es una función.'],
   descripcion: 'Llega al cofre del mirador.', objetivo: 'Crea una función que haga un escalón y úsala para llegar al cofre.',
   comandos: R0, permite: ['repetir', 'variables', 'si', 'sino', 'funcion'], requiere: 'funcion', inicio: { x: 1, y: 7, dir: 0 }, optimo: 12, recompensa: ['🏹 Arco'], pista: null, decor: [],
   mapa: ['############', '#######G####', '######..####', '#####..#####', '####..######', '###..#######', '##..########', '#S.#########'] },
 { id: 7, nombre: 'La guarida del oso', icono: '🐻', escenario: 'guarida', pos: [36, 20], tema: 'condicionales', jefe: true,
   historia: ['Estamos en lo más profundo del bosque. Un enorme oso nos bloquea el paso. ¡Con mi arco y todo lo que aprendimos podemos superarlo!', 'El oso avisa hacia dónde lanza su zarpazo. Lee el aviso y escribe el código para esquivarlo ANTES de que se acabe el tiempo. ¡Tienes 3 corazones!'],
   descripcion: 'Desafío final.', objetivo: 'Esquiva cada ataque con código. Usa esquivar_izquierda(); y esquivar_derecha(); (y disparar(); con el arco).',
   comandos: ['esquivar_izquierda', 'esquivar_derecha', 'disparar'], permite: ['repetir', 'variables', 'si', 'sino', 'funcion'], inicio: { x: 5, y: 6, dir: 3 }, optimo: null, recompensa: ['🏆 Victoria'],
   pista: 'Si el zarpazo va a la izquierda, esquiva a la derecha. En el medio, ve hacia cualquier lado. Con varios zarpazos iguales usa repetir.',
   rondas: [{ a: ['izquierda'] }, { a: ['derecha'] }, { a: ['centro'] }, { a: ['izquierda'], t: 10, rapido: 1 }, { a: ['derecha', 'derecha', 'derecha'] }, { a: ['izquierda', 'derecha', 'izquierda'] }],
   decor: [], mapa: ['############', '#..........#', '#..........#', '#..........#', '#..........#', '#..........#', '#..........#', '#..........#'] }
];

const SOLUCIONES = { // código completo que la ayuda muestra al pedirla por tercera vez
 0: 'avanzar();\navanzar();\navanzar();\navanzar();\n', 1: 'avanzar();\navanzar();\navanzar();\navanzar();\nizquierda();\navanzar();\navanzar();\navanzar();\n', 2: 'troncos = 3;\navanzar();\navanzar();\navanzar();\nconstruir_puente();\navanzar();\navanzar();\navanzar();\navanzar();\navanzar();\n',
 3: 'linterna();\nrepetir(3) {\n  avanzar();\n}\nizquierda();\nrepetir(4) {\n  avanzar();\n}\nderecha();\nrepetir(8) {\n  avanzar();\n}\nizquierda();\navanzar();',
 4: 'repetir(9) {\n  avanzar();\n}\nderecha();\nrepetir(5) {\n  avanzar();\n}\nderecha();\nrepetir(9) {\n  avanzar();\n}',
 5: 'repetir(3) {\n  repetir(2) {\n    avanzar();\n  }\n  izquierda();\n  repetir(2) {\n    avanzar();\n  }\n  derecha();\n}',
 6: 'funcion escalon() {\n  avanzar();\n  izquierda();\n  avanzar();\n  derecha();\n}\nrepetir(6) {\n  escalon();\n}' };
function solucion() { // en el jefe la solución depende del ataque actual
  if (G.n.jefe) return G.jefe.r.a.map(a => a === 'derecha' ? 'esquivar_izquierda();' : 'esquivar_derecha();').join('\n') + '\ndisparar();';
  return SOLUCIONES[G.n.id];
}

/* Temas visuales: s = colores del suelo, a = colores de árbol, b = tipo de bloque, luz = radio de luz (oscuridad) */
const TEMAS = {
 campamento: { s: ['#6aa84a', '#5e9a40', '#7bb856'], b: 'arbol', a: ['#5a3a1e', '#1f4a2a', '#2f6d36', '#4b9444'], amb: 'hojas' },
 rio: { s: ['#6aa84a', '#5e9a40', '#7bb856'], b: 'arbol', a: ['#5a3a1e', '#1f4a2a', '#2f6d36', '#4b9444'], amb: 'hojas' },
 bosque: { s: ['#8b6b3e', '#7a5c34', '#9a7a4a'], b: 'arbol', a: ['#4a2f18', '#17391f', '#25592c', '#3a7a3a'], amb: 'hojas' },
 noche: { s: ['#243a2a', '#1d3123', '#2c4632'], b: 'arbol', a: ['#2a1a10', '#0b1a14', '#12281d', '#1a3a28'], luz: 90, amb: 'luc', luna: 1 },
 cueva: { s: ['#4a4a5a', '#41414f', '#55556a'], b: 'pared', luz: 120, amb: 'polvo' },
 montana: { s: ['#9a8f7a', '#8a806c', '#aa9f88'], b: 'monte', amb: 'viento', aves: 1 },
 mirador: { s: ['#c9a46a', '#b8935a', '#d8b47a'], b: 'cielo', amb: 'viento', aves: 1 },
 guarida: { s: ['#4a3322', '#3d2a1b', '#58402c'], b: 'arbol', a: ['#2a1a10', '#10261a', '#183a24', '#245232'], luz: 190, amb: 'luc' }
};

/* ===== 2. ESTADO Y GUARDADO (localStorage) ===== */
const BASE = { puntos: 0, xp: 0, hechos: {}, intentos: 0, errores: 0, pistas: 0, tiempo: 0, objetos: {}, op: { sonido: true, musica: true, reducir: false } };
let S_ = JSON.parse(JSON.stringify(BASE));
try { Object.assign(S_, JSON.parse(localStorage.getItem('codenilo2') || '{}')); } catch (e) { /* sin datos previos */ }
const guardar = () => { try { localStorage.setItem('codenilo2', JSON.stringify(S_)); } catch (e) { /* almacenamiento bloqueado */ } };
const reducido = () => S_.op.reducir || matchMedia('(prefers-reduced-motion: reduce)').matches;
let G = null, pantalla = 'titulo', X, ctx;

/* ===== 3. AUDIO (Web Audio API: todo se genera con código, sin archivos) ===== */
let AC = null;
function ac() { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; }
function tono(f, d, tipo, v, delay, f2) {
  const a = ac(), t = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
  o.type = tipo || 'square'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(v || .06, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d);
}
function ruido(d, v, delay) { // ráfaga de ruido filtrado (zarpazos, esquivar)
  const a = ac(), n = a.sampleRate * d, b = a.createBuffer(1, n, a.sampleRate), c = b.getChannelData(0);
  for (let i = 0; i < n; i++) c[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400;
  s.buffer = b; g.gain.value = v; s.connect(f); f.connect(g); g.connect(a.destination); s.start(a.currentTime + (delay || 0));
}
const arp = (ns, tipo, d) => ns.forEach((f, i) => tono(f, d || .18, tipo || 'square', .05, i * .1));
const SFX = { // Para añadir un sonido nuevo: agrega una línea aquí y llámalo con sfx('nombre')
  caminar: () => tono(150 + Math.random() * 40, .07, 'triangle', .05), recoger: () => arp([660, 880, 1320], 'triangle', .12),
  ejecutar: () => tono(330, .2, 'square', .05, 0, 660), error: () => tono(160, .3, 'sawtooth', .06, 0, 80),
  completar: () => arp([523, 659, 784, 1046], 'square'), desbloquear: () => arp([392, 523, 659], 'triangle'),
  abrir: () => { tono(200, .3, 'square', .05, 0, 400); arp([523, 784], 'triangle') }, click: () => tono(500, .05, 'square', .04),
  ataque: () => ruido(.35, .15), rugido: () => { tono(110, 1, 'sawtooth', .09, 0, 45); tono(80, 1, 'square', .05, .05, 40) },
  esquivar: () => ruido(.25, .08), victoria: () => arp([523, 659, 784, 1046, 784, 1046, 1318], 'square', .2), puente: () => { ruido(.3, .1); tono(120, .2, 'triangle', .07) }
};
const sfx = n => { if (S_.op.sonido) try { SFX[n](); } catch (e) { /* audio no disponible */ } };
const MUS = { campamento: { n: [262, 294, 330, 392, 440], t: 'triangle', p: 1 }, rio: { n: [294, 330, 392, 440, 494], t: 'sine', p: 1 }, bosque: { n: [220, 262, 294, 330], t: 'triangle', p: 1 },
 noche: { n: [220, 262, 330, 294], t: 'sine', v: 640 }, cueva: { n: [196, 233, 262, 311], t: 'sine', v: 700 }, montana: { n: [330, 392, 440, 494, 587], t: 'triangle' },
 mirador: { n: [392, 440, 523, 587, 659], t: 'triangle' }, guarida: { n: [110, 131, 147, 165], t: 'sawtooth', v: 600 } };
let musT = null, musZ = 'campamento';
function musica(z) { // música ambiental sencilla: notas suaves al azar de una escala por escenario
  musZ = z || musZ; clearInterval(musT); musT = null; if (!S_.op.musica || !AC) return;
  const M = MUS[musZ] || MUS.campamento; let i = 0, k = 0;
  musT = setInterval(() => { k++; i = Math.max(0, Math.min(M.n.length - 1, i + Math.floor(Math.random() * 3) - 1));
    if (k % 2 === 0) tono(M.n[i], .9, M.t, .03); if (k % 8 === 1) tono(M.n[0] / 2, 2.2, 'sine', .04);
    if (M.p && Math.random() < .2) tono(2000 + Math.random() * 800, .1, 'sine', .02, 0, 2900); }, M.v || 520);
}

/* ===== 4. INTÉRPRETE: texto -> tokens -> árbol -> ejecución (genera "pasos" para animar) ===== */
class Fin { constructor(ok, msg) { this.ok = ok; this.msg = msg; } }
function tokenizar(src) {
  const re = /\s*(?:(\/\/[^\n]*)|([A-Za-zÁÉÍÓÚáéíóúñÑ_][\wÁÉÍÓÚáéíóúñÑ]*)|(\d+)|("[^"]*")|(==|!=|<=|>=|-=|\+=|[-+<>=(){};,]))/y;
  const tk = []; let linea = 1, pos = 0, m;
  while (pos < src.length) {
    re.lastIndex = pos; m = re.exec(src);
    if (!m) { if (!src.slice(pos).trim()) break; throw new Error(`Hay un símbolo que Nilo no entiende en la línea ${linea}: "${src.slice(pos).trim()[0]}"`); }
    linea += (m[0].match(/\n/g) || []).length; pos = re.lastIndex;
    if (m[1]) continue;
    tk.push({ t: m[2] ? 'id' : m[3] ? 'num' : m[4] ? 'str' : 'sym', v: m[2] || m[3] || m[4] || m[5], l: linea });
  }
  return tk;
}
function parsear(tk) { // convierte los tokens en un árbol de instrucciones
  let i = 0; const ver = () => tk[i], sig = () => tk[i++];
  const nombres = { ';': 'el punto y coma ( ; )', '(': 'un paréntesis que abre "("', ')': 'un paréntesis que cierra ")"', '{': 'la llave que abre "{"', '}': 'la llave que cierra "}"' };
  const esp = v => { const t = tk[i]; if (!t || t.v !== v) { const l = (t && v !== ';' ? t : tk[i - 1] || { l: 1 }).l; throw new Error(`Falta ${nombres[v]} cerca de la línea ${l}.`); } i++; };
  const bloque = () => { esp('{'); const s = []; while (ver() && ver().v !== '}') s.push(stmt()); esp('}'); return s; };
  function term() {
    const t = sig(); if (!t) throw new Error('El código termina de forma inesperada. ¿Falta algo?');
    if (t.t === 'num') return { v: +t.v }; if (t.t === 'str') return { v: t.v.slice(1, -1) };
    if (t.v === '(') { const e = expr(); esp(')'); return e; }
    if (t.t === 'id') { if (ver() && ver().v === '(') { sig(); esp(')'); return { f: t.v }; } return { n: t.v }; }
    throw new Error(`No entiendo "${t.v}" en la línea ${t.l}.`);
  }
  function suma() { let a = term(); while (ver() && (ver().v === '+' || ver().v === '-')) { const o = sig().v; a = { o, a, b: term() }; } return a; }
  function expr() { const a = suma(); if (ver() && ['==', '!=', '<', '>', '<=', '>='].includes(ver().v)) { const o = sig().v; return { o, a, b: suma() }; } return a; }
  function stmt() {
    const t = sig(); if (t.t !== 'id') throw new Error(`Nilo no entiende "${t.v}" en la línea ${t.l}. Cada línea empieza con el nombre de una orden.`);
    if (t.v === 'repetir') { esp('('); const n = expr(); esp(')'); return { k: 'rep', n, b: bloque() }; }
    if (t.v === 'si') { esp('('); const c = expr(); esp(')'); const a = bloque(); let b = []; if (ver() && ver().v === 'sino') { sig(); b = bloque(); } return { k: 'si', c, a, b }; }
    if (t.v === 'funcion') { const n = sig(); if (!n || n.t !== 'id') throw new Error('Una función necesita un nombre: funcion miFuncion() { ... }'); esp('('); esp(')'); return { k: 'fun', n: n.v, b: bloque() }; }
    const n = ver();
    if (n && n.v === '(') { sig(); esp(')'); esp(';'); return { k: 'call', n: t.v }; }
    if (n && ['=', '-=', '+='].includes(n.v)) { sig(); const e = expr(); esp(';'); return { k: 'set', n: t.v, o: n.v, e }; }
    throw new Error(`Después de "${t.v}" (línea ${t.l}) deberían ir los paréntesis: ${t.v}();`);
  }
  const ast = []; while (i < tk.length) ast.push(stmt()); return ast;
}
const contar = l => l.reduce((n, s) => n + 1 + (s.b ? contar(s.b) : 0) + (s.a ? contar(s.a) : 0), 0);
function chequear(ast, n, defs) { // revisa nombres y herramientas permitidas ANTES de ejecutar
  for (const s of ast) {
    if (s.k === 'call' && !defs[s.n]) {
      if (!CMD.includes(s.n)) throw new Error(`Comando desconocido: ${s.n}()`);
      if (!n.comandos.includes(s.n)) throw new Error('Nilo no puede realizar esa acción aquí.');
    }
    const need = { rep: 'repetir', si: 'si', fun: 'funcion', set: 'variables' }[s.k];
    if (need && !n.permite.includes(need)) throw new Error(`Todavía no necesitas "${need}" en esta parte de la aventura. Usa solo los comandos de la misión.`);
    [s.a, s.b].forEach(b => b && chequear(b, n, defs));
  }
}
function ev(e, S) { // evalúa una expresión (números, variables, comparaciones)
  if ('v' in e) return e.v;
  if (e.n) { if (!(e.n in S.vars)) throw new Error(`La variable "${e.n}" todavía no existe. Créala primero, por ejemplo: ${e.n} = 1;`); return S.vars[e.n]; }
  if (e.f) return llamar(e.f, S, true);
  const a = ev(e.a, S), b = ev(e.b, S);
  switch (e.o) { case '+': return a + b; case '-': return a - b; case '==': return a === b; case '!=': return a !== b;
    case '<': return a < b; case '>': return a > b; case '<=': return a <= b; default: return a >= b; }
}
function exec(lista, S) {
  for (const s of lista) {
    if (++S.n > 3000) throw new Error('Tu código se repite demasiadas veces. Revisa tus bucles.');
    if (s.k === 'call') llamar(s.n, S);
    else if (s.k === 'set') {
      const v = ev(s.e, S);
      if (s.o === '=') S.vars[s.n] = v;
      else { if (!(s.n in S.vars)) throw new Error(`La variable "${s.n}" todavía no existe. Créala primero: ${s.n} = 0;`); S.vars[s.n] += s.o === '+=' ? v : -v; }
      P(S, 'var');
    } else if (s.k === 'rep') {
      const n = ev(s.n, S); if (typeof n !== 'number' || n < 0) throw new Error('repetir necesita un número, por ejemplo: repetir(3) { ... }');
      for (let i = 0; i < n; i++) exec(s.b, S);
    } else if (s.k === 'si') exec(ev(s.c, S) ? s.a : s.b, S);
  }
}
function llamar(nm, S, esExpr) {
  if (S.funs[nm] && !esExpr) return exec(S.funs[nm], S);
  if (!CMD.includes(nm)) throw new Error(`Comando desconocido: ${nm}()`);
  if (!S.nivel.comandos.includes(nm)) throw new Error('Nilo no puede realizar esa acción aquí.');
  return ACC[nm](S);
}
const P = (S, t, extra) => S.pasos.push(Object.assign({ t, x: S.x, y: S.y, d: S.dir, v: { ...S.vars } }, extra)); // anota un paso para animar
function celda(S, x, y) { if (x < 0 || y < 0 || x >= COLS || y >= FILAS) return 'f'; const c = S.nivel.mapa[y][x]; return c === '~' && S.puente[x + ',' + y] ? '.' : c; }
const ACC = { // Para agregar un comando: escribe aquí su acción, añade su nombre en CMD y en 'comandos' del nivel
  avanzar(S) {
    const nx = S.x + DX[S.dir], ny = S.y + DY[S.dir], c = celda(S, nx, ny);
    if (c === 'f' || c === '#' || c === '~') { P(S, 'choque'); throw new Fin(false, c === '~' ? '¡Hay un río! Nilo no puede cruzarlo nadando: necesita un puente.' : 'Nilo chocó con un obstáculo. Revisa tu código.'); }
    S.x = nx; S.y = ny; P(S, 'mov');
    if (c === '^') { P(S, 'caer'); throw new Fin(false, 'Nilo cayó en un pozo oculto. ¡Usa la linterna para verlos!'); }
    if (c === 'G') throw new Fin(true);
  },
  izquierda(S) { S.dir = (S.dir + 3) % 4; P(S, 'giro'); },
  derecha(S) { S.dir = (S.dir + 1) % 4; P(S, 'giro'); },
  camino_libre(S) { const c = celda(S, S.x + DX[S.dir], S.y + DY[S.dir]); return !(c === 'f' || c === '#' || c === '~'); },
  construir_puente(S) {
    if (!('troncos' in S.vars)) throw new Error('Nilo todavía no tiene troncos en la mochila. Primero escribe: troncos = 3;');
    if (S.vars.troncos < 3) throw new Fin(false, `Nilo solo tiene ${S.vars.troncos} troncos y el puente necesita 3. Cambia el valor de troncos.`);
    const c = [1, 2, 3].map(k => [S.x + DX[S.dir] * k, S.y + DY[S.dir] * k]);
    if (!c.every(p => celda(S, p[0], p[1]) === '~')) throw new Error('Nilo no puede realizar esa acción aquí. El puente se construye mirando al río, desde la orilla.');
    S.vars.troncos -= 3; c.forEach(p => S.puente[p[0] + ',' + p[1]] = 1); P(S, 'puente', { c });
  },
  linterna(S) {
    if (S.vars.bateria <= 0) throw new Fin(false, '¡Se acabó la batería de la linterna!');
    S.vars.bateria -= 1; P(S, 'luz');
  },
  esquivar_izquierda(S) { S.lane = Math.max(0, S.lane - 1); S.lanes.push(S.lane); },
  esquivar_derecha(S) { S.lane = Math.min(2, S.lane + 1); S.lanes.push(S.lane); },
  disparar(S) { S.disparo = true; }
};
function simular(src, S) { // devuelve S con los pasos a animar, o lanza Error si el código está mal escrito
  const ast = parsear(tokenizar(src)), defs = {};
  ast.forEach(s => { if (s.k === 'fun') defs[s.n] = s.b; });
  chequear(ast, S.nivel, defs);
  Object.assign(S, { funs: defs, pasos: [], n: 0, fin: null, nodos: contar(ast), tieneFun: Object.keys(defs).length > 0 });
  try { exec(ast, S); } catch (e) { if (e instanceof Fin) S.fin = e; else throw e; }
  if (!S.jefe) {
    if (!S.fin) S.fin = new Fin(false, 'Nilo tomó un camino incorrecto. Revisa tu código.');
    else if (S.fin.ok && S.nivel.requiere === 'funcion' && !S.tieneFun) S.fin = new Fin(false, 'Llegaste, pero sin usar una función. Crea una con: funcion nombre() { ... }');
  }
  return S;
}

/* ===== 5. DIBUJO (pixel art hecho con rectángulos: no usa imágenes) ===== */
const R = (x, y, w, h, c) => { X.fillStyle = c; X.fillRect(x, y, w, h); };
const hash = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
function suelo(x, y, T) {
  const px = x * TILE, py = y * TILE; R(px, py, TILE, TILE, T.s[0]);
  for (let k = 0; k < 8; k++) { const h = hash(x * 9 + k, y * 7 + k * 3); R(px + Math.floor(h * 9) * 4, py + Math.floor(hash(k, x + y * 5) * 9) * 4, 4, 4, T.s[1 + (k & 1)]); }
}
function arbol(px, py, a) {
  R(px + 16, py + 24, 8, 16, a[0]); R(px + 14, py + 36, 12, 4, a[0]);
  R(px + 4, py + 10, 32, 18, a[1]); R(px + 8, py + 2, 24, 12, a[1]);
  R(px + 6, py + 12, 28, 14, a[2]); R(px + 10, py + 4, 20, 10, a[2]);
  R(px + 10, py + 8, 10, 6, a[3]); R(px + 22, py + 16, 8, 5, a[3]);
}
function cristal(px, py, c) { R(px + 4, py, 4, 4, c); R(px + 2, py + 4, 8, 8, c); R(px + 4, py + 12, 4, 4, c); R(px + 4, py + 4, 2, 4, '#e8ffff'); }
function bloque(x, y, T) {
  const px = x * TILE, py = y * TILE;
  if (T.b === 'arbol') arbol(px, py, T.a);
  else if (T.b === 'pared') { R(px, py, 40, 40, '#2b2b38'); R(px + 2, py + 2, 36, 36, '#3a3a4c'); R(px + 4, py + 4, 16, 12, '#4c4c62'); R(px + 22, py + 20, 14, 14, '#33334a'); if (hash(x, y) > .6) { cristal(px + 14, py + 12, '#4fd8ee'); G.brillos.push([px + 20, py + 20]); } }
  else { R(px, py, 40, 40, '#4a4d55'); R(px + 2, py + 4, 36, 34, '#6a6e78'); R(px + 6, py + 6, 18, 12, '#8b8f99'); R(px + 24, py + 22, 12, 12, '#575b64'); if (y < 3) { R(px + 6, py, 28, 8, '#f2f6fa'); R(px + 10, py + 8, 12, 4, '#dbe6f0'); } }
}
function cielo(x, y) { // mirador: el vacío es un cielo de atardecer con montañas lejanas
  const cs = ['#3a2a5a', '#7a3a6a', '#c0505a', '#e8793a', '#f2b84b', '#f7d98a', '#e8a860', '#b86a5a'], px = x * TILE, py = y * TILE;
  R(px, py, 40, 40, cs[y]); if (y > 4 && hash(x, 3) > .3 - (y - 5) * .2) R(px, py, 40, 40, y > 5 ? '#5a3a5a' : '#8a4a6a');
  if (y < 3 && hash(x, y) > .6) R(px + 8, py + 14, 24, 6, '#f7c9a0');
}
function agua(x, y, t) {
  const px = x * TILE, py = y * TILE; R(px, py, 40, 40, '#3f8fb0');
  for (let k = 0; k < 3; k++) { const o = (t / 30 + k * 17 + x * 11) % 40; R(px + o, py + 6 + k * 12, Math.min(10, 40 - o), 3, '#8fd0e6'); }
}
function fondoNivel(n) { // dibuja una vez el escenario fijo en un canvas oculto (más rápido)
  const c = document.createElement('canvas'); c.width = 480; c.height = 320; const prev = X; X = c.getContext('2d'); const T = TEMAS[n.escenario]; G.brillos = [];
  for (let y = 0; y < FILAS; y++) for (let x = 0; x < COLS; x++) { const ch = n.mapa[y][x]; if (ch === '~') continue; if (ch === '#' && T.b === 'cielo') cielo(x, y); else suelo(x, y, T); }
  if (T.b === 'cielo') { R(420, 20, 36, 36, '#fff3c4'); R(424, 16, 28, 44, '#fff3c4'); }
  for (let y = 0; y < FILAS; y++) for (let x = 0; x < COLS; x++) if (n.mapa[y][x] === '#' && T.b !== 'cielo') bloque(x, y, T);
  X = prev; return c;
}
function nilo(cx, fy, dir, t, anda, s, luz) { // cx,fy = centro y pies del personaje
  const b = anda ? Math.round(Math.sin(t / 70)) : 0, w = anda ? Math.round(Math.sin(t / 70) * 3) : 0, f = dir === 2 ? -1 : 1;
  X.save(); X.translate(cx, fy); X.scale(f * s * .9, s * .9);
  R(-13, -3, 26, 5, 'rgba(0,0,0,.28)'); R(-7 + w, -6, 6, 6, '#3b2414'); R(1 - w, -6, 6, 6, '#3b2414'); R(-6, -13, 12, 8, '#6b4a2a');
  if (dir !== 1) { R(-15, -28 + b, 9, 16, '#4a2f1a'); R(-14, -27 + b, 7, 14, '#8a5a2e'); R(-14, -21 + b, 7, 2, '#5e3c22'); } // mochila
  R(-7, -26 + b, 14, 14, '#2f5d34'); R(-5, -24 + b, 10, 10, '#c8a860'); R(-7, -14 + b, 14, 3, '#3b2414');
  if (dir !== 3) { R(2, -15 + b, 5, 5, '#f2b84b'); R(3, -14 + b, 3, 3, '#8a3a2a'); } // brújula
  R(5, -24 + b, 4, 10, '#2f5d34'); R(5, -15 + b, 4, 4, '#f2c28a'); R(-6, -38 + b, 12, 12, '#f2c28a');
  if (dir === 3) R(-6, -38 + b, 12, 12, '#5a3a1e'); else { R(-6, -38 + b, 12, 4, '#5a3a1e'); R(dir === 1 ? -4 : 2, -33 + b, 3, 3, '#1a1008'); if (dir === 1) R(2, -33 + b, 3, 3, '#1a1008'); }
  R(-10, -41 + b, 20, 4, '#d8c28a'); R(-7, -47 + b, 14, 7, '#d8c28a'); R(-7, -42 + b, 14, 2, '#8a3a2a'); // sombrero
  if (luz) { R(9, -18 + b, 5, 7, '#f2b84b'); R(10, -17 + b, 3, 5, '#fff3c4'); }
  X.restore();
}
function decorar(d, t) {
  const px = d[1] * TILE, py = d[2] * TILE, tp = d[0];
  if (tp === 'tienda') { [[16, 24, '#c0602a'], [12, 20, '#d9763a'], [8, 28, '#d9763a'], [4, 32, '#d9763a']].forEach((r, i) => R(px + 20 - r[0] / 2 * 2 / 1 + 0, py + 6 + i * 8, r[0] * 2, 8, r[2])); R(px + 14, py + 24, 12, 12, '#3b2414'); }
  else if (tp === 'fogata') { R(px + 8, py + 30, 24, 6, '#4a2f1a'); R(px + 6, py + 34, 28, 4, '#6b4a2a'); const h = 8 + Math.sin(t / 90) * 4 + Math.sin(t / 37) * 2; R(px + 14, py + 26 - h, 12, h + 4, '#e8793a'); R(px + 17, py + 28 - h * .7, 6, h * .7 + 2, '#f2b84b'); R(px + 18, py + 30 - h * .4, 4, h * .4, '#fff3c4'); }
  else if (tp === 'mochila') { R(px + 10, py + 14, 20, 22, '#4a2f1a'); R(px + 12, py + 16, 16, 18, '#8a5a2e'); R(px + 14, py + 24, 12, 4, '#5e3c22'); R(px + 12, py + 10, 16, 6, '#6b4a2a'); }
  else if (tp === 'persona') { const c = ['#c0392b', '#2980b9'][d[3] || 0]; R(px + 12, py + 28, 16, 8, '#3b2414'); R(px + 12, py + 16, 16, 14, c); R(px + 14, py + 4, 12, 12, '#f2c28a'); R(px + 14, py + 2, 12, 5, d[3] ? '#e0c060' : '#3a2a1a'); }
  else if (tp === 'cartel') { R(px + 18, py + 14, 4, 24, '#4a2f1a'); R(px + 6, py + 8, 28, 12, '#8a5a2e'); R(px + 8, py + 10, 24, 8, '#c9a46a'); R(px + 22, py + 13, 6, 2, '#4a2f1a'); }
  else if (tp === 'conejo') { R(px + 12, py + 24, 16, 12, '#e8e0d0'); R(px + 24, py + 18, 10, 10, '#e8e0d0'); R(px + 26, py + 8, 3, 10, '#e8e0d0'); R(px + 31, py + 8, 3, 10, '#e8e0d0'); R(px + 30, py + 21, 2, 2, '#222'); }
  else if (tp === 'tronco') { R(px + 4, py + 18, 32, 14, '#4a2f1a'); R(px + 6, py + 20, 28, 10, '#8a5a2e'); R(px + 30, py + 20, 4, 10, '#d8b47a'); R(px + 10, py + 23, 14, 2, '#6b4a2a'); }
  else if (tp === 'roca') { R(px + 6, py + 20, 28, 16, '#4a4d55'); R(px + 8, py + 18, 22, 14, '#8b8f99'); R(px + 12, py + 20, 8, 4, '#b0b4be'); }
  else if (tp === 'cristal') { cristal(px + 12, py + 10, '#4fd8ee'); R(px + 4, py + 28, 32, 4, 'rgba(79,216,238,.35)'); }
}
function meta(m, t) { // la meta: bandera, o cofre en el mirador
  const px = m.x * TILE, py = m.y * TILE;
  if (G.n.escenario === 'mirador') { R(px + 6, py + 16, 28, 20, '#4a2f1a'); R(px + 8, py + 18, 24, 16, '#8a5a2e'); R(px + 8, py + 12, 24, 8, '#a8743a'); R(px + 17, py + 20, 6, 8, '#f2b84b'); if (G.abierto) { R(px + 8, py + 4, 24, 10, '#fff3c4'); } }
  else { R(px + 12, py + 6, 3, 30, '#f1e3bd'); const w = Math.round(Math.sin(t / 200) * 2); R(px + 15, py + 6, 14 + w, 8, '#e8793a'); R(px + 15, py + 12, 10 + w, 4, '#c0602a'); R(px + 6, py + 34, 16, 4, 'rgba(0,0,0,.3)'); }
}
function ambiente(T, t) { // partículas decorativas (hojas, luciérnagas, polvo, viento, pájaros)
  if (!T.amb || reducido()) return;
  for (let i = 0; i < 12; i++) {
    const h = hash(i, 1), x = (h * 480 + (T.amb === 'viento' ? t / 8 * (1 + h) : Math.sin(t / 900 + i) * 20)) % 480, y = T.amb === 'hojas' ? (h * 320 + t / 40 * (.5 + h)) % 320 : (hash(i, 2) * 320 + Math.sin(t / 700 + i) * 12) % 320;
    if (T.amb === 'hojas') R(x, y, 4, 4, i % 2 ? '#d9a441' : '#7bb856');
    else if (T.amb === 'viento') R(x, y, 14, 2, 'rgba(255,255,255,.35)');
    else if (T.amb === 'polvo') R(x, y, 2, 2, 'rgba(200,220,255,.4)');
  }
  if (T.aves) { const ph = (t / 1000) % 14; if (ph < 7) { const bx = ph / 7 * 560 - 40, by = 40 + Math.sin(ph * 2) * 10, a = Math.sin(t / 120) > 0 ? 3 : -3; R(bx, by + a, 6, 3, '#2a1a0e'); R(bx + 6, by, 4, 3, '#2a1a0e'); R(bx + 10, by + a, 6, 3, '#2a1a0e'); } }
}
function luciernagas(t) { if (reducido()) return; for (let i = 0; i < 14; i++) { const x = (hash(i, 5) * 480 + Math.sin(t / 1100 + i) * 30), y = (hash(i, 6) * 320 + Math.cos(t / 900 + i * 2) * 20); if (Math.sin(t / 400 + i * 3) > -.3) { R(x - 3, y - 3, 6, 6, 'rgba(242,184,75,.3)'); R(x - 1, y - 1, 3, 3, '#fff3a0'); } } }
function oscuridad(T, cx, cy, luz) { // capa oscura con un círculo de luz alrededor de Nilo
  const o = G.ov || (G.ov = document.createElement('canvas')); o.width = 480; o.height = 320; const c = o.getContext('2d');
  c.fillStyle = `rgba(4,8,20,${T.b === 'pared' ? .82 : T.luz > 150 ? .55 : .78})`; c.fillRect(0, 0, 480, 320); c.globalCompositeOperation = 'destination-out';
  const hoyo = (x, y, r) => { const g = c.createRadialGradient(x, y, r * .3, x, y, r); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); };
  hoyo(cx, cy, T.luz + (luz ? 60 : 0)); G.brillos.forEach(b => hoyo(b[0], b[1], 36)); X.drawImage(o, 0, 0);
}
function dibujar(t) {
  const n = G.n, T = TEMAS[n.escenario], V = G.V, ta = reducido() ? 0 : t;
  X.save(); if (G.shake > 0) { X.translate((Math.random() - .5) * 6, (Math.random() - .5) * 6); G.shake--; }
  X.clearRect(0, 0, 480, 320);
  if (n.jefe) { dibujarJefe(t); X.restore(); return; }
  for (let y = 0; y < FILAS; y++) for (let x = 0; x < COLS; x++) if (n.mapa[y][x] === '~') { agua(x, y, ta); if (G.puente[x + ',' + y]) { R(x * 40, y * 40 + 6, 40, 28, '#8a5a2e'); R(x * 40, y * 40 + 14, 40, 3, '#4a2f1a'); R(x * 40, y * 40 + 24, 40, 3, '#4a2f1a'); } }
  X.drawImage(G.fondo, 0, 0);
  n.decor.forEach(d => { if (!G.tomados[d.join()]) decorar(d, ta); });
  if (G.meta) meta(G.meta, ta);
  const s = V.cae ? Math.max(.1, 1 - V.cae) : 1; nilo(V.px + 20, V.py + 38, V.dir, t, V.anda, s, V.luz);
  ambiente(T, ta);
  if (T.luz) { oscuridad(T, V.px + 20, V.py + 20, V.luz); if (T.luna) { R(430, 20, 28, 28, '#f1ecd0'); R(438, 16, 24, 28, '#16203a'); } luciernagas(ta); }
  if (G.vistos) for (let y = 0; y < FILAS; y++) for (let x = 0; x < COLS; x++) if (n.mapa[y][x] === '^') { R(x * 40 + 4, y * 40 + 10, 32, 24, '#e8793a'); R(x * 40 + 6, y * 40 + 12, 28, 20, '#050505'); R(x * 40 + 10, y * 40 + 14, 12, 3, '#3a2a1a'); } // pozos revelados por la linterna
  G.part = G.part.filter(p => p.l > 0); G.part.forEach(p => { p.x += p.vx; p.y += p.vy; p.l--; R(p.x, p.y, 4, 4, p.c); });
  X.restore();
}
const chispas = (x, y, c) => { if (!reducido()) for (let i = 0; i < 14; i++) G.part.push({ x, y, vx: (Math.random() - .5) * 5, vy: -Math.random() * 4, l: 30, c: c || ['#f2b84b', '#fff3c4', '#8fd0e6'][i % 3] }); };

/* ===== 6. JUEGO: niveles, animación de pasos, victoria, errores ===== */
function iniciarNivel(id) {
  const n = NIVELES[id]; let ini = n.inicio, meta = null;
  n.mapa.forEach((f, y) => [...f].forEach((c, x) => { if (c === 'S') ini = { x, y, dir: n.inicio.dir }; if (c === 'G') meta = { x, y }; }));
  G = { n, fondo: null, V: { px: ini.x * TILE, py: ini.y * TILE, x: ini.x, y: ini.y, dir: ini.dir }, puente: {}, vistos: false, cola: [], cur: null, part: [], shake: 0, tomados: {},
        meta, errN: 0, pistasN: 0, corriendo: false, ini, brillos: [], abierto: false };
  G.fondo = fondoNivel(n);
  ir('juego'); $('nom').textContent = `${n.icono} ${n.nombre}`; $('mision').textContent = n.descripcion; $('objetivo').textContent = '🎯 ' + n.objetivo;
  $('ayudaNivel').innerHTML = n.explica || ''; $('ed').value = n.jefe ? '// Mira el aviso del oso y escribe tu respuesta\n' : '// Escribe aquí tus órdenes\n';
  mostrarVars(n.vars || {}); refrescar(); msg('Escribe tus órdenes y pulsa EJECUTAR.');
  if (n.jefe) { G.jefe = { vidas: 3, energia: 6, ronda: 0 }; sfx('rugido'); }
  dialogo(n.historia, () => { if (n.jefe) nuevaRonda(); $('ed').focus(); });
}
function reiniciar(sinMensaje) {
  const n = G.n, i = G.ini; G.cola = []; G.cur = null; G.corriendo = false; G.puente = {}; G.abierto = false;
  Object.assign(G.V, { px: i.x * TILE, py: i.y * TILE, x: i.x, y: i.y, dir: i.dir, anda: false, cae: 0, luz: false, lane: 1 });
  mostrarVars(n.vars || {}); if (!sinMensaje) msg('Escenario reiniciado. ¡Inténtalo de nuevo!');
}
function mostrarVars(v) { $('vars').innerHTML = Object.keys(v).map(k => `<span>${k}: ${v[k]}</span>`).join(''); }
function msg(t, tipo) { const m = $('msg'); m.textContent = t; m.className = tipo || ''; }
function falla(texto) { S_.errores++; G.errN++; guardar(); msg('⚠️ ' + texto, 'err'); sfx('error'); G.shake = 12; }
function ejecutar() {
  if (G.corriendo || !$('dialogo').hidden) return;
  const n = G.n; if (n.jefe) return ejecutarJefe();
  reiniciar(true); S_.intentos++;
  let S; try { S = simular($('ed').value, { nivel: n, x: G.ini.x, y: G.ini.y, dir: G.ini.dir, vars: { ...(n.vars || {}) }, puente: {}, lane: 1, lanes: [] }); }
  catch (e) { return falla(e.message); }
  G.S = S; G.cola = S.pasos.slice(); G.corriendo = true; G.res = S.fin; sfx('ejecutar'); msg('Nilo se pone en marcha…');
}
function actualizar(t) {
  const V = G.V, c = G.cur;
  if (c) {
    const p = Math.min(1, (t - c.t0) / c.dur);
    if (c.t === 'mov') { V.px = c.fx + (c.tx - c.fx) * p; V.py = c.fy + (c.ty - c.fy) * p; }
    else if (c.t === 'caer') V.cae = p; else if (c.t === 'esq') V.px = c.fx + (c.tx - c.fx) * p;
    if (p >= 1) { finPaso(c); G.cur = null; }
  } else if (G.cola.length) iniciarPaso(G.cola.shift(), t);
  else if (G.corriendo) { G.corriendo = false; V.anda = false; terminar(); }
  if (G.jefe && !G.corriendo && $('dialogo').hidden && G.jefe.vivo && (t - G.jefe.t0) / 1000 > G.jefe.lim) { G.jefe.vivo = false; msg('⏰ ¡Se acabó el tiempo!', 'err'); resolverJefe({ lanes: [], disparo: false }); }
}
function iniciarPaso(p, t) {
  const V = G.V, k = reducido() ? .5 : 1; G.cur = Object.assign({}, p, { t0: t, dur: 340 * k });
  if (p.v) mostrarVars(p.v);
  if (p.t === 'mov') { Object.assign(G.cur, { fx: V.px, fy: V.py, tx: p.x * TILE, ty: p.y * TILE }); V.anda = true; sfx('caminar'); }
  else { V.anda = false; if (p.t === 'giro') { V.dir = p.d; G.cur.dur = 150 * k; } }
  if (p.t === 'puente') { p.c.forEach(q => G.puente[q[0] + ',' + q[1]] = 1); sfx('puente'); G.cur.dur = 700 * k; }
  else if (p.t === 'luz') { V.luz = true; G.vistos = true; sfx('recoger'); G.cur.dur = 450 * k; }
  else if (p.t === 'choque') { G.shake = 14; sfx('error'); G.cur.dur = 450 * k; }
  else if (p.t === 'caer') G.cur.dur = 600 * k;
  else if (p.t === 'esq') { Object.assign(G.cur, { fx: V.px, tx: LANE[p.lane] - 20 }); sfx('esquivar'); G.cur.dur = 250 * k; }
  else if (p.t === 'garra') { sfx('ataque'); G.cur.dur = 650 * k; }
  else if (p.t === 'flecha') { sfx('esquivar'); G.cur.dur = 400 * k; }
  else if (p.t === 'var') G.cur.dur = 200 * k;
}
function finPaso(c) {
  const V = G.V; if (c.t === 'mov') { V.x = c.x; V.y = c.y; }
  if (c.t === 'garra') { if (c.hit) { G.shake = 14; sfx('error'); } }
}
function terminar() {
  if (G.n.jefe) return finRondaJefe();
  const f = G.res; if (f.ok) return victoria();
  if (G.n.escenario === 'noche' && G.S.pasos.every(p => p.t === 'luz' || p.t === 'var')) { msg('🔦 ¡La linterna mostró los pozos! Ahora planea un camino que los evite.', 'ok'); return; }
  falla(f.msg);
}
function victoria() {
  const n = G.n, nuevo = !S_.hechos[n.id], det = []; let pts = 0;
  if (nuevo) {
    det.push(['Misión completada', 100]); if (!G.errN) det.push(['Sin errores', 50]);
    if (n.optimo && G.S && G.S.nodos <= n.optimo) det.push(['Solución eficiente', 50]); if (!G.pistasN) det.push(['Sin usar ayuda', 25]);
    pts = det.reduce((a, d) => a + d[1], 0); S_.puntos += pts; S_.xp += Math.round(pts * .6); S_.hechos[n.id] = 1; (n.recompensa || []).forEach(o => S_.objetos[o] = 1);
  }
  guardar(); actualizarBarra(); G.abierto = true; chispas(G.V.px + 20, G.V.py, null); sfx(n.jefe ? 'victoria' : 'completar'); if (n.escenario === 'mirador') sfx('abrir');
  const sig = NIVELES[n.id + 1], lista = det.map(d => `<li>+${d[1]} ${d[0]}</li>`).join('') || '<li>Ya habías completado este nivel.</li>';
  const extra = n.jefe ? `<p><b>🏆 ¡Derrotaste al oso y completaste la aventura!</b> Nilo guarda su arco, mira el atardecer y emprende el regreso a casa. Aprendió que programar es dar órdenes claras, probar, corregir y volver a intentar.</p>`
    : (n.recompensa && n.recompensa.length ? `<p>Objeto conseguido: <b>${n.recompensa.join(', ')}</b></p>` : '');
  if (sig && nuevo) setTimeout(() => sfx('desbloquear'), 900);
  modal(n.jefe ? '🏆 ¡HAS GANADO EL JUEGO!' : '✅ MISIÓN COMPLETADA', `<ul>${lista}</ul>${extra}<p>Puntos: <b>${S_.puntos}</b> · XP: <b>${S_.xp}</b></p>`,
    [...(sig ? [{ t: 'Siguiente aventura ▶', f: () => iniciarNivel(sig.id) }] : []), { t: 'Ir al mapa', f: () => ir('mapa') }]);
}

/* ===== 7. JEFE FINAL: el oso lanza zarpazos y Nilo los esquiva programando ===== */
function nuevaRonda() {
  const J = G.jefe, r = G.n.rondas[J.ronda % G.n.rondas.length]; Object.assign(J, { r, t0: performance.now(), lim: r.t || 25, vivo: true });
  const dic = a => a.map(x => x === 'centro' ? 'en el medio' : 'hacia la ' + x).join(', luego ');
  $('mision').textContent = `🐻 ${r.rapido ? '¡ATAQUE RÁPIDO! ' : ''}El oso lanza ${r.a.length > 1 ? r.a.length + ' zarpazos' : 'un zarpazo'} ${dic(r.a)}.`;
  $('objetivo').textContent = `🎯 Ataque ${J.ronda + 1} de ${G.n.rondas.length} · Variable ataque = "${r.a[0]}" · Tiempo: ${r.t || 25} s`;
  reiniciar(true); msg('Escribe el código para esquivar antes de que se acabe el tiempo.');
}
function ejecutarJefe() {
  const J = G.jefe; if (!J.vivo) return; S_.intentos++;
  let S; try { S = simular($('ed').value, { nivel: G.n, jefe: true, x: 0, y: 0, dir: 0, vars: { ataque: J.r.a[0], cantidad: J.r.a.length }, puente: {}, lane: 1, lanes: [] }); }
  catch (e) { return falla(e.message); }
  J.vivo = false; sfx('ejecutar'); resolverJefe(S);
}
function resolverJefe(S) { // convierte el código del jugador en pasos animados: esquivar + zarpazo (+ flecha)
  const J = G.jefe, pasos = []; J.golpes = 0; J.disparo = !!S.disparo;
  J.r.a.forEach((a, i) => {
    const lane = S.lanes.length ? S.lanes[Math.min(i, S.lanes.length - 1)] : 1, hit = lane === ATQ[a];
    pasos.push({ t: 'esq', lane }, { t: 'garra', lane: ATQ[a], hit }); if (hit) J.golpes++;
  });
  if (J.disparo) pasos.push({ t: 'flecha' });
  G.cola = pasos; G.corriendo = true;
}
function finRondaJefe() {
  const J = G.jefe;
  if (J.golpes) {
    J.vidas = Math.max(0, J.vidas - J.golpes); falla(`¡Nilo recibió ${J.golpes} golpe(s)! Revisa el aviso del oso.`);
    if (!J.vidas) return modal('💔 Nilo se quedó sin energía', '<p>No te rindas: programar es probar, corregir y volver a intentar.</p>', [{ t: 'Reintentar', f: () => iniciarNivel(G.n.id) }, { t: 'Ir al mapa', f: () => ir('mapa') }]);
  } else { J.energia -= 1 + (J.disparo ? 1 : 0); J.ronda++; msg('✅ ¡Esquivó el ataque!' + (J.disparo ? ' Además, ¡la flecha dio en el blanco!' : ''), 'ok'); sfx('esquivar'); if (J.energia <= 0) return victoria(); }
  nuevaRonda();
}
function oso(cx, cy, t, rugir) {
  R(cx - 64, cy - 6, 128, 90, '#3a2414'); R(cx - 56, cy, 112, 78, '#5e3c22'); R(cx - 40, cy + 20, 80, 50, '#7a5230'); // cuerpo
  R(cx - 90, cy + 8, 26, 66, '#3a2414'); R(cx + 64, cy + 8, 26, 66, '#3a2414'); for (let i = 0; i < 3; i++) { R(cx - 88 + i * 8, cy + 72, 4, 12, '#f1e3bd'); R(cx + 68 + i * 8, cy + 72, 4, 12, '#f1e3bd'); } // brazos y garras
  R(cx - 38, cy - 70, 76, 62, '#3a2414'); R(cx - 32, cy - 64, 64, 50, '#6a4527'); R(cx - 46, cy - 80, 20, 20, '#3a2414'); R(cx + 26, cy - 80, 20, 20, '#3a2414'); R(cx - 40, cy - 74, 8, 8, '#8a5a3a'); R(cx + 32, cy - 74, 8, 8, '#8a5a3a'); // cabeza y orejas
  R(cx - 18, cy - 34, 36, 24, '#c49a6c'); R(cx - 7, cy - 38, 14, 10, '#1a1008'); R(cx - 24, cy - 52, 10, 10, rugir ? '#ff4a2a' : '#f2e8d0'); R(cx + 14, cy - 52, 10, 10, rugir ? '#ff4a2a' : '#f2e8d0'); R(cx - 20, cy - 54, 6, 4, '#1a1008'); R(cx + 14, cy - 54, 6, 4, '#1a1008');
  if (rugir) { R(cx - 14, cy - 18, 28, 12, '#2a0a0a'); R(cx - 12, cy - 18, 5, 5, '#fff'); R(cx + 7, cy - 18, 5, 5, '#fff'); }
}
const CORAZON = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
function dibujarJefe(t) {
  const J = G.jefe, V = G.V, c = G.cur; X.drawImage(G.fondo, 0, 0);
  oso(240, 110 + (reducido() ? 0 : Math.sin(t / 300) * 3), t, c && c.t === 'garra' || (J.vivo && t % 1600 < 300));
  if (J.vivo && J.r) J.r.a.forEach((a, i) => { const lx = LANE[ATQ[a]]; X.fillStyle = 'rgba(220,50,30,.3)'; X.fillRect(lx - 34, 200, 68, 110); R(lx - 34, 200, 4, 110, '#e04a2a'); R(lx + 30, 200, 4, 110, '#e04a2a'); X.fillStyle = '#fff'; X.font = 'bold 22px Verdana'; X.textAlign = 'center'; X.fillText('!' + (J.r.a.length > 1 ? i + 1 : ''), lx, 262); });
  if (c && c.t === 'garra') { const lx = LANE[c.lane], a = 1 - Math.abs((t - c.t0) / c.dur - .5) * 2; X.globalAlpha = Math.max(0, a); for (let k = 0; k < 3; k++) for (let j = 0; j < 9; j++) R(lx - 26 + k * 18 + j * 2, 190 + j * 12, 8, 12, '#fff3c4'); X.globalAlpha = 1; }
  if (c && c.t === 'flecha') { const p = (t - c.t0) / c.dur; R(V.px + 18, 250 - p * 150, 4, 22, '#d8c28a'); R(V.px + 16, 246 - p * 150, 8, 6, '#c0c0c0'); }
  nilo(V.px + 20, 304, 3, t, false, 1.6, false);
  for (let i = 0; i < 3; i++) CORAZON.forEach((f, y) => [...f].forEach((ch, x) => { if (ch === 'X') R(10 + i * 30 + x * 3, 10 + y * 3, 3, 3, i < J.vidas ? '#e0302a' : '#4a2a2a'); }));
  R(330, 10, 140, 14, '#2a1a0e'); R(332, 12, 136 * Math.max(0, J.energia) / 6, 10, '#e8793a'); X.fillStyle = '#fff'; X.font = 'bold 12px Verdana'; X.textAlign = 'right'; X.fillText('OSO', 326, 22);
  if (J.vivo) { const q = Math.max(0, 1 - (t - J.t0) / 1000 / J.lim); R(0, 314, 480, 6, '#2a1a0e'); R(0, 314, 480 * q, 6, q < .3 ? '#e0302a' : '#f2b84b'); }
}

/* ===== 8. INTERFAZ: pantallas, mapa, editor, ventanas, opciones ===== */
function ir(p) {
  pantalla = p; ['titulo', 'mapa', 'juego'].forEach(x => $('s-' + x).hidden = x !== p); $('barra').hidden = p === 'titulo';
  if (p === 'mapa') dibujarMapa(); musica(p === 'juego' ? G.n.escenario : 'campamento'); actualizarBarra();
}
function actualizarBarra() {
  $('d-xp').textContent = S_.xp; $('d-pts').textContent = S_.puntos;
  [['b-son', S_.op.sonido], ['b-mus', S_.op.musica]].forEach(a => $(a[0]).setAttribute('aria-pressed', a[1]));
  $('b-son').textContent = S_.op.sonido ? '🔊 Sonido' : '🔇 Sonido'; $('b-mus').textContent = S_.op.musica ? '🎵 Música' : '🎵 Música (off)';
  document.body.classList.toggle('reducir', S_.op.reducir);
}
const desbloqueado = id => id === 0 || !!S_.hechos[id - 1];
function dibujarMapa() {
  const m = $('mapa'), pts = NIVELES.map(n => n.pos.join(',')).join(' '), act = NIVELES.find(n => desbloqueado(n.id) && !S_.hechos[n.id]);
  m.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="#8a5a2e" stroke-width=".7" stroke-dasharray="2 1.5"/></svg>`;
  NIVELES.forEach(n => {
    const b = document.createElement('button'), ok = desbloqueado(n.id);
    b.className = 'nodo' + (ok ? '' : ' bloq') + (S_.hechos[n.id] ? ' hecha' : '') + (act && act.id === n.id ? ' actual' : '');
    b.style.left = n.pos[0] + '%'; b.style.top = n.pos[1] + '%'; b.innerHTML = `<b>${ok ? n.icono : '🔒'}</b>${n.id ? n.id + '. ' : ''}${n.nombre.replace('Tutorial · ', '')}`;
    b.setAttribute('aria-label', n.nombre + (ok ? '' : ' (bloqueada)'));
    b.onclick = () => { if (ok) { sfx('click'); iniciarNivel(n.id); } else { sfx('error'); b.textContent = '🔒 ¡Completa la zona anterior!'; setTimeout(dibujarMapa, 1400); } };
    m.appendChild(b);
  });
}
function modal(t, h, bs) {
  $('mt').textContent = t; $('mb').innerHTML = h; const c = $('mbt'); c.innerHTML = '';
  (bs || [{ t: 'Cerrar' }]).forEach(b => { const e = document.createElement('button'); e.textContent = b.t; e.onclick = () => { cerrar(); b.f && b.f(); }; c.appendChild(e); });
  $('modal').hidden = false; c.firstChild.focus();
}
const cerrar = () => { $('modal').hidden = true; };
function dialogo(lineas, fin) { // Nilo cuenta la historia en una cajita sobre el escenario
  let i = 0; const d = $('dialogo'), ver = () => { $('dtxt').textContent = 'Nilo: ' + lineas[i]; $('dsig').textContent = i < lineas.length - 1 ? 'Siguiente ▶' : '¡A jugar!'; };
  d.hidden = false; ver();
  $('dsig').onclick = () => { sfx('click'); i++; if (i >= lineas.length) { d.hidden = true; fin && fin(); } else ver(); };
  $('dsig').focus();
}
function abrirGuia(tema) {
  modal('📖 GUÍA DE CÓDIGO', GUIA.map(g => `<h3 id="g-${g[0]}">${g[1]}</h3>${g[2]}`).join('') + '<p><i>Todo esto, con ejemplos de la aventura de Nilo, te ayuda en cualquier nivel.</i></p>');
  if (tema && $('g-' + tema)) $('g-' + tema).scrollIntoView();
}
function ayuda() {
  if (!G) return; S_.pistas++; G.pistasN++; guardar(); const n = G.n, g = G_(n.tema), sol = G.pistasN >= 3 ? solucion() : null;
  modal('💡 Ayuda de Nilo', `<p>${n.pista || 'Nilo piensa: repasa la Guía de código y recuerda lo que aprendiste.'}</p>` +
    (sol ? `<h3>🔑 Código de la solución</h3><p>Ya pediste ayuda 3 veces, así que Nilo te muestra el código completo:</p><pre>${sol}</pre>`
         : `<p><i>Ayuda ${G.pistasN} de 2. A la tercera vez, Nilo te muestra el código.</i></p>`) + `<h3>${g[1]}</h3>${g[2]}`,
    sol ? [{ t: 'Pegar en el editor', f: () => { $('ed').value = sol; refrescar(); } }, { t: 'Cerrar' }] : undefined);
}
function estadisticas() {
  const hechos = Object.keys(S_.hechos).length, min = Math.round(S_.tiempo / 60), objs = Object.keys(S_.objetos);
  modal('MIS ESTADÍSTICAS', `<div class="rejilla"><div>Niveles completados<b>${hechos} / ${NIVELES.length}</b></div><div>Puntuación<b>${S_.puntos}</b></div><div>XP<b>${S_.xp}</b></div>
   <div>Intentos<b>${S_.intentos}</b></div><div>Errores<b>${S_.errores}</b></div><div>Pistas usadas<b>${S_.pistas}</b></div><div>Tiempo aproximado<b>${min} min</b></div>
   <div>Progreso<b>${Math.round(hechos / NIVELES.length * 100)}%</b></div></div><h3>Objetos encontrados</h3><p>${objs.join(' · ') || 'Todavía ninguno. ¡Explora!'}</p>`);
}
function opciones() {
  modal('OPCIONES', `<p><label><input type="checkbox" id="o-s" ${S_.op.sonido ? 'checked' : ''}> Efectos de sonido</label></p><p><label><input type="checkbox" id="o-m" ${S_.op.musica ? 'checked' : ''}> Música</label></p>
   <p><label><input type="checkbox" id="o-r" ${S_.op.reducir ? 'checked' : ''}> Reducir animaciones</label></p><p><button id="o-borrar" class="sec">Borrar mi progreso</button></p>`);
  const sw = (id, k) => $(id).onchange = e => { S_.op[k] = e.target.checked; guardar(); actualizarBarra(); if (k === 'musica') musica(); };
  sw('o-s', 'sonido'); sw('o-m', 'musica'); sw('o-r', 'reducir');
  $('o-borrar').onclick = () => { if (confirm('¿Seguro que quieres borrar todo tu progreso?')) { S_ = JSON.parse(JSON.stringify(BASE)); guardar(); actualizarBarra(); cerrar(); } };
}
/* Editor: el texto real está en el textarea; el <pre> de atrás lo repinta con colores */
function refrescar() {
  const t = $('ed').value, esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  $('hl').innerHTML = esc(t).replace(/(\/\/[^\n]*)|("[^"]*")|\b(repetir|sino|si|funcion)\b|\b(\d+)\b|\b([A-Za-zñÑ_]\w*)(?=\()/g,
    (m, c, s, k, n, f) => c ? `<span class="c">${m}</span>` : s ? `<span class="s">${m}</span>` : k ? `<span class="k">${m}</span>` : n ? `<span class="n">${m}</span>` : `<span class="f">${m}</span>`) + '\n';
  $('nums').textContent = t.split('\n').map((_, i) => i + 1).join('\n'); sincronizar();
}
function sincronizar() { $('hl').scrollTop = $('ed').scrollTop; $('hl').scrollLeft = $('ed').scrollLeft; $('nums').scrollTop = $('ed').scrollTop; }
function dibujarTitulo() { // portada: Nilo frente a un atardecer de bosque
  const c = $('c-titulo'); X = c.getContext('2d'); const cs = ['#3a2a5a', '#6a3a6a', '#a84a5a', '#e8793a', '#f2b84b', '#f7d98a'];
  cs.forEach((col, i) => R(0, i * 32, 480, 32, col)); R(190, 120, 100, 60, '#fff3c4'); R(200, 112, 80, 76, '#fff3c4'); R(176, 140, 128, 30, '#fff3c4');
  for (let l = 0; l < 2; l++) for (let x = 0; x < 480; x += 8) { const h = 40 + hash(x / 8, l) * 50 + l * 25; R(x, 230 - h + l * 20, 8, h, l ? '#5a3a5a' : '#8a4a6a'); }
  R(0, 250, 480, 70, '#2f5d34'); for (let x = 0; x < 480; x += 8) R(x, 250 + hash(x, 9) * 6, 8, 4, '#4b9444');
  [20, 70, 390, 440, 130, 340].forEach((x, i) => { arbol(x, 190 + (i % 2) * 15, TEMAS.campamento.a); R(x + 6, 214 + (i % 2) * 15, 28, 20, TEMAS.campamento.a[1]); });
  nilo(240, 296, 0, 0, false, 3, false);
}
function cargarGuardado() { /* el progreso ya se leyó arriba (S_); aquí solo se prepara la barra */ actualizarBarra(); }

/* Arranque */
function bucle(t) { requestAnimationFrame(bucle); if (pantalla === 'juego' && G) { X = ctx; actualizar(t); dibujar(t); } }
window.addEventListener('load', () => {
  ctx = $('lienzo').getContext('2d'); ctx.imageSmoothingEnabled = false; dibujarTitulo(); cargarGuardado();
  $('t-jugar').onclick = () => { sfx('click'); ir('mapa'); }; $('t-guia').onclick = () => abrirGuia(); $('t-stats').onclick = estadisticas; $('t-op').onclick = opciones;
  $('t-cred').onclick = () => modal('CRÉDITOS', '<p style="text-align:center;font-size:20px">Pablo Ovando<br><br>Stephan Centurión<br><br>Claude</p>');
  $('b-mapa').onclick = () => { if (G) { G.corriendo = false; } ir('mapa'); }; $('b-guia').onclick = () => abrirGuia(); $('marca').onclick = () => ir('titulo');
  $('b-son').onclick = () => { S_.op.sonido = !S_.op.sonido; guardar(); actualizarBarra(); }; $('b-mus').onclick = () => { S_.op.musica = !S_.op.musica; guardar(); actualizarBarra(); musica(); };
  $('b-run').onclick = ejecutar; $('b-reset').onclick = () => { if (G) { reiniciar(); if (G.jefe) nuevaRonda(); } }; $('b-ayuda').onclick = ayuda;
  const ed = $('ed'); ed.addEventListener('input', refrescar); ed.addEventListener('scroll', sincronizar);
  ed.addEventListener('keydown', e => { if (e.key === 'Tab') { e.preventDefault(); document.execCommand('insertText', false, '  '); } if (e.key === 'Enter' && e.ctrlKey) ejecutar(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });
  document.addEventListener('pointerdown', () => { ac(); if (!musT) musica(); }, { once: true });
  setInterval(() => { if (pantalla === 'juego') { S_.tiempo++; if (S_.tiempo % 10 === 0) guardar(); } }, 1000);
  requestAnimationFrame(bucle);
});
