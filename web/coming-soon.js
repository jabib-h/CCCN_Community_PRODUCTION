"use strict";
/* Obra en construcción: UNA escena al azar por carga de página, con un personaje en
   pixel art (generado con Higgsfield: Recraft V4.1 + remoción de fondo, ver
   docs/PIXEL_ART_ASSETS.md) que camina de un lado a otro de su carril. Todo el estilo
   dinámico va por clases o por CSSOM (element.style desde JS) — nunca por atributo
   style="" en el HTML (CSP: style-src 'self', ver CLAUDE.md). Las burbujas de diálogo
   solo llevan texto mientras están visibles (atributo hidden) para que no queden frases
   "fantasma" en el DOM cuando se selecciona/copia el texto de la página. */

// Carriles + parámetros de caminata: cada personaje recibe una combinación distinta
// (distancia, duración, arranque) para que el movimiento no se sienta sincronizado y
// para que use el ancho completo de la escena.
const WALK = [
  { lane: "lane-a", dist: 170, dur: 11, delay: -1.2 },
  { lane: "lane-b", dist: 200, dur: 13, delay: -6.4 },
  { lane: "lane-solo", dist: 190, dur: 12, delay: -3.1 },
];

function actorHTML(a, walk) {
  // .bubble vive dentro de .actor__walk (sigue la posición al caminar) pero FUERA de
  // .actor__facing (que es lo único que se espeja al voltear) — así el texto de la
  // burbuja nunca aparece invertido cuando el personaje mira hacia el otro lado.
  return `
  <div class="actor ${walk.lane}" data-dialogues='${JSON.stringify(a.say)}' tabindex="0" role="button"
       aria-label="${a.role}">
    <div class="actor__walk" data-dist="${walk.dist}" data-dur="${walk.dur}" data-delay="${walk.delay}">
      <div class="bubble" hidden></div>
      <div class="actor__facing">
        <div class="sprite-shadow"></div>
        <img class="sprite" src="/shared/sprites/${a.sprite}.png" alt="" width="220" height="280" loading="eager"/>
      </div>
    </div>
  </div>`;
}

const SCENES = [
  {
    id: "weld", cls: "cs-scene--weld",
    actors: [
      { sprite: "weld-1", role: "Soldador",
        say: ["Una junta más y la viga de la Comunidad de Práctica queda firme.", "¡Cuidado con las chispas, esto va a quedar sólido!", "Estamos soldando lo que va a sostener cinco módulos a la vez.", "Cada punto de soldadura es una promesa que no se puede romper."] },
      { sprite: "weld-2", role: "Supervisora",
        say: ["Revisen esa unión antes de seguir, no hay prisa que valga.", "La estructura crece más rápido cuando trabajamos en equipo.", "Esto lo construimos para que dure generaciones de estudiantes.", "Buen trabajo — la base ya soporta toda la plataforma."] }
    ]
  },
  {
    id: "code", cls: "cs-scene--code",
    actors: [
      { sprite: "code-1", role: "Programador",
        say: ["Estoy afinando el control de acceso, nadie entra sin permiso.", "Un módulo menos en construcción, cuatro por terminar.", "Este commit deja la bitácora a prueba de manipulaciones.", "Escribo código pensando en quien lo va a leer en tres años."] },
      { sprite: "code-2", role: "Programadora",
        say: ["Estoy probando que ningún dato de menores se filtre.", "La plataforma tiene que sentirse simple aunque por dentro sea compleja.", "Vamos a lanzar esto cuando esté listo, no antes.", "Ya casi conectamos las cinco piezas del Hub."] }
    ]
  },
  {
    id: "arch", cls: "cs-scene--arch",
    actors: [
      { sprite: "arch-1", role: "Arquitecta",
        say: ["Este plano conecta la biblioteca física con la digital.", "Midamos dos veces, construyamos una sola vez.", "Cada muro que dibujo protege un dato de alguien.", "Este diseño tiene que crecer sin romperse."] },
      { sprite: "arch-2", role: "Ingeniero",
        say: ["Ahí va la sala de credenciales, justo al centro del plano.", "Si lo construimos bien, dura veinte años sin remodelar.", "Este plano es la promesa de todo lo que viene.", "Firmamos este diseño con la misma seriedad que un edificio real."] }
    ]
  },
  {
    id: "magic", cls: "cs-scene--magic",
    actors: [
      { sprite: "magic-1", role: "Mago",
        say: ["Una pizca de comunidad, dos cucharadas de conocimiento.", "Esta poción convierte datos sueltos en sabiduría compartida.", "Cuidado: lo que hierve ahí adentro va a sorprender a todos.", "La magia real es que cinco servicios funcionen como uno solo."] }
    ]
  },
  {
    id: "lab", cls: "cs-scene--lab",
    actors: [
      { sprite: "lab-1", role: "Científica",
        say: ["Esta muestra confirma que el cifrado aguanta la prueba.", "Repito el experimento hasta que no quede duda alguna.", "La fórmula exacta: seguridad más simplicidad, en partes iguales.", "Anoto cada resultado — la próxima persona debe poder repetirlo."] }
    ]
  },
  {
    id: "data", cls: "cs-scene--data",
    actors: [
      { sprite: "data-1", role: "Analista de datos",
        say: ["Esta gráfica va a decidir qué contenido llega primero a cada persona.", "Cada barra representa una comunidad de práctica creciendo.", "Estoy buscando el patrón que conecta biblioteca, revista y talleres.", "Los datos, bien leídos, construyen la mejor red de sabiduría."] }
    ]
  },
  {
    id: "write", cls: "cs-scene--write",
    actors: [
      { sprite: "write-1", role: "Escritora",
        say: ["Este capítulo explica cómo una comunidad se vuelve una sola voz.", "Tacho, reescribo, y queda mejor cada vez.", "Cada palabra tiene que merecer el lugar en la página.", "Esta es la obra que va a presentar la Revista Académica."] }
    ]
  },
  {
    id: "paint", cls: "cs-scene--paint",
    actors: [
      { sprite: "paint-1", role: "Pintora",
        say: ["Cada trazo es un módulo nuevo tomando color.", "Estoy pintando cómo se ve una comunidad que aprende junta.", "El rojo y el azul de siempre, mezclados con algo nuevo.", "Cuando la vean terminada, van a querer ser parte de esto."] }
    ]
  },
  {
    id: "farm", cls: "cs-scene--farm",
    actors: [
      { sprite: "farm-1", role: "Agricultor",
        say: ["Cada semilla es una idea que alguien va a cosechar después.", "Esta tierra va a alimentar a las mejores mentes del futuro.", "No hay atajos para hacer crecer una buena comunidad.", "Riego esto todos los días, como quien cuida un proyecto de verdad."] }
    ]
  },
  {
    id: "cook", cls: "cs-scene--cook",
    actors: [
      { sprite: "cook-1", role: "Chef",
        say: ["El secreto está en dejar que todo se integre a fuego lento.", "Una pizca de biblioteca, otra de comunidad, y a revolver.", "Esto no sale de una receta — sale de años de práctica.", "Cuando lo prueben, van a pedir la receta completa."] }
    ]
  },
  {
    id: "bridge", cls: "cs-scene--bridge",
    actors: [
      { sprite: "bridge-1", role: "Constructor",
        say: ["Cada remache es un cambio que ya se probó en beta.", "Este puente es lo que separa un experimento de algo real.", "Nada cruza a producción sin pasar antes por acá.", "Firme, remache a remache, hasta que aguante cualquier tráfico."] },
      { sprite: "bridge-2", role: "Constructora",
        say: ["Del otro lado ya está esperando community.centrocultural.cr.", "Revisamos dos veces antes de dejar pasar cualquier cambio.", "Este puente lo cruzan datos de personas reales — se construye con cuidado.", "Cuando esté listo, nadie va a notar la costura."] }
    ]
  },
  {
    id: "stars", cls: "cs-scene--stars",
    actors: [
      { sprite: "stars-1", role: "Exploradora",
        say: ["Ahí arriba hay tantas ideas como estrellas por conectar.", "Estoy trazando el mapa que va a guiar a quien llegue después.", "Cada punto de luz es una persona más aprendiendo con nosotros.", "Todavía no está completo el mapa, pero ya se ve el camino."] }
    ]
  }
];

function starsHTML(n) {
  let out = "";
  for (let i = 0; i < n; i++) out += '<span class="star"></span>';
  return out;
}

function renderScene(scene) {
  const el = document.getElementById("cs-scene");
  const isStars = scene.id === "stars";
  el.className = "cs-scene " + scene.cls;
  el.innerHTML = `
    ${isStars ? starsHTML(12) : ""}
    ${scene.actors.map((a, i) => actorHTML(a, WALK[scene.actors.length === 1 ? 2 : i])).join("")}
    <div class="cs-scene__ground"></div>
  `;
  if (isStars) {
    el.querySelectorAll(".star").forEach((s) => {
      s.style.left = Math.round(8 + Math.random() * 84) + "%";
      s.style.top = Math.round(4 + Math.random() * 46) + "%";
      s.style.animationDelay = (Math.random() * 2.4).toFixed(2) + "s";
    });
  }
  el.querySelectorAll(".actor__walk").forEach((w) => {
    w.style.setProperty("--walk-dist", w.dataset.dist + "px");
    w.style.animationDuration = w.dataset.dur + "s";
    w.style.animationDelay = w.dataset.delay + "s";
    // .actor__facing (el volteo) corre con la MISMA duración/demora que .actor__walk
    // (el movimiento) para que el personaje se voltee justo cuando llega al extremo.
    const facing = w.querySelector(".actor__facing");
    facing.style.animationDuration = w.dataset.dur + "s";
    facing.style.animationDelay = w.dataset.delay + "s";
  });
}

function initScene() {
  const host = document.getElementById("cs-scene");
  if (!host) return;

  renderScene(SCENES[Math.floor(Math.random() * SCENES.length)]);

  let lastLine = null;
  function speak(actorEl) {
    const lines = JSON.parse(actorEl.dataset.dialogues || "[]");
    if (!lines.length) return;
    let line = lines[Math.floor(Math.random() * lines.length)];
    if (lines.length > 1 && line === lastLine) {
      line = lines[(lines.indexOf(line) + 1) % lines.length];
    }
    lastLine = line;
    const bubble = actorEl.querySelector(".bubble");
    bubble.textContent = line;
    bubble.hidden = false;
    requestAnimationFrame(() => bubble.classList.add("is-visible"));
    clearTimeout(actorEl._hideTimer);
    actorEl._hideTimer = setTimeout(() => {
      bubble.classList.remove("is-visible");
      bubble.hidden = true;
      bubble.textContent = "";
    }, 3400);
  }

  host.addEventListener("click", (e) => {
    const actorEl = e.target.closest(".actor");
    if (actorEl) speak(actorEl);
  });
  host.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const actorEl = e.target.closest(".actor");
    if (actorEl) { e.preventDefault(); speak(actorEl); }
  });
}

document.addEventListener("DOMContentLoaded", initScene);
