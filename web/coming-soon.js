"use strict";
/* Obra en construcción: UNA escena al azar por carga de página, con personajes que
   caminan de un lado a otro de su carril mientras ejecutan su función. Todo el estilo
   dinámico va por clases o por CSSOM (element.style desde JS) — nunca por atributo
   style="" en el HTML (CSP: style-src 'self', ver CLAUDE.md). Las burbujas de diálogo
   solo llevan texto mientras están visibles (atributo hidden) para que no queden frases
   "fantasma" en el DOM cuando se selecciona/copia el texto de la página. */

// Carriles + parámetros de caminata: cada personaje recibe una combinación distinta
// (distancia, duración, arranque) para que el movimiento no se sienta sincronizado.
const WALK = [
  { lane: "lane-a", dist: 92, dur: 8.5, delay: -1.2 },
  { lane: "lane-b", dist: 118, dur: 10.5, delay: -4.8 },
  { lane: "lane-solo", dist: 105, dur: 9.5, delay: -2.4 },
];

function actorHTML(a, walk) {
  const sparks = a.sparks ? '<span class="spark"></span><span class="spark"></span><span class="spark"></span>' : "";
  const tool = a.tool ? `<span class="tool ${a.tool}">${sparks}</span>` : "";
  return `
  <div class="actor ${walk.lane}" data-dialogues='${JSON.stringify(a.say)}' tabindex="0" role="button"
       aria-label="${a.role}">
    <div class="actor__walk" data-dist="${walk.dist}" data-dur="${walk.dur}" data-delay="${walk.delay}">
      <div class="bubble" hidden></div>
      <div class="rig-scale">
        <div class="rig ${a.pose}">
          <div class="rig__leg rig__leg--l"><span class="rig__foot"></span></div>
          <div class="rig__leg rig__leg--r"><span class="rig__foot"></span></div>
          <div class="rig__torso ${a.outfit}"></div>
          <div class="rig__arm rig__arm--l"><span class="rig__hand"></span></div>
          <div class="rig__arm rig__arm--r"><span class="rig__hand"></span>${tool}</div>
          <div class="rig__head">${a.acc ? `<span class="acc ${a.acc}"></span>` : ""}</div>
        </div>
      </div>
    </div>
  </div>`;
}

const SCENES = [
  {
    id: "weld", cls: "cs-scene--weld",
    props: `<div class="prop prop-frame">
      <div class="prop-frame__bar prop-frame__bar--v1"></div><div class="prop-frame__bar prop-frame__bar--v2"></div>
      <div class="prop-frame__bar prop-frame__bar--h1"></div><div class="prop-frame__bar prop-frame__bar--h2"></div>
      <div class="prop-frame__bar prop-frame__bar--x1"></div><div class="prop-frame__bar prop-frame__bar--x2"></div>
      <div class="prop-frame__chip">COMMUNITY</div></div>`,
    actors: [
      { pose: "pose-weld", acc: "acc-hardhat", tool: "tool-torch", sparks: true, outfit: "outfit-orange", role: "Soldador",
        say: ["Una junta más y la viga de la Comunidad de Práctica queda firme.", "¡Cuidado con las chispas, esto va a quedar sólido!", "Estamos soldando lo que va a sostener cinco módulos a la vez.", "Cada punto de soldadura es una promesa que no se puede romper."] },
      { pose: "pose-point", acc: "acc-hardhat--cyan", outfit: "outfit-navy", role: "Supervisora",
        say: ["Revisen esa unión antes de seguir, no hay prisa que valga.", "La estructura crece más rápido cuando trabajamos en equipo.", "Esto lo construimos para que dure generaciones de estudiantes.", "Buen trabajo — la base ya soporta toda la plataforma."] }
    ]
  },
  {
    id: "code", cls: "cs-scene--code",
    props: `<div class="prop prop-desk"><div class="prop-desk__monitor">
      <div class="prop-desk__line"></div><div class="prop-desk__line"></div><div class="prop-desk__line"></div>
      <span class="prop-desk__cursor"></span></div><div class="prop-desk__top"></div></div>`,
    actors: [
      { pose: "pose-type", acc: "acc-glasses", outfit: "outfit-blue", role: "Programador",
        say: ["Estoy afinando el control de acceso, nadie entra sin permiso.", "Un módulo menos en construcción, cuatro por terminar.", "Este commit deja la bitácora a prueba de manipulaciones.", "Escribo código pensando en quien lo va a leer en tres años."] },
      { pose: "pose-type", acc: "acc-visor", outfit: "outfit-olive", role: "Programadora",
        say: ["Estoy probando que ningún dato de menores se filtre.", "La plataforma tiene que sentirse simple aunque por dentro sea compleja.", "Vamos a lanzar esto cuando esté listo, no antes.", "Ya casi conectamos las cinco piezas del Hub."] }
    ]
  },
  {
    id: "arch", cls: "cs-scene--arch",
    props: `<div class="prop prop-table"><div class="prop-table__paper"></div><div class="prop-table__top"></div></div>`,
    actors: [
      { pose: "pose-lean", acc: "acc-visor", tool: "tool-pencil", outfit: "outfit-olive", role: "Arquitecta",
        say: ["Este plano conecta la biblioteca física con la digital.", "Midamos dos veces, construyamos una sola vez.", "Cada muro que dibujo protege un dato de alguien.", "Este diseño tiene que crecer sin romperse."] },
      { pose: "pose-point", tool: "tool-book", acc: "acc-cap", outfit: "outfit-navy", role: "Ingeniero",
        say: ["Ahí va la sala de credenciales, justo al centro del plano.", "Si lo construimos bien, dura veinte años sin remodelar.", "Este plano es la promesa de todo lo que viene.", "Firmamos este diseño con la misma seriedad que un edificio real."] }
    ]
  },
  {
    id: "magic", cls: "cs-scene--magic",
    props: `<div class="prop prop-cauldron"><span class="bub"></span><span class="bub"></span><span class="bub"></span>
      <div class="prop-cauldron__glow"></div><div class="prop-cauldron__pot"></div></div>`,
    actors: [
      { pose: "pose-stir", acc: "acc-hat-wizard", tool: "tool-ladle", outfit: "outfit-purple", role: "Mago",
        say: ["Una pizca de comunidad, dos cucharadas de conocimiento.", "Esta poción convierte datos sueltos en sabiduría compartida.", "Cuidado: lo que hierve ahí adentro va a sorprender a todos.", "La magia real es que cinco servicios funcionen como uno solo."] }
    ]
  },
  {
    id: "lab", cls: "cs-scene--lab",
    props: `<div class="prop prop-lab"><div class="beaker"><div class="beaker__liq"></div></div>
      <div class="beaker"><div class="beaker__liq"></div></div><div class="beaker"><div class="beaker__liq"></div></div>
      <div class="prop-lab__bench"></div></div>`,
    actors: [
      { pose: "pose-dip", acc: "acc-glasses", tool: "tool-pipette", outfit: "outfit-cream", role: "Científica",
        say: ["Esta muestra confirma que el cifrado aguanta la prueba.", "Repito el experimento hasta que no quede duda alguna.", "La fórmula exacta: seguridad más simplicidad, en partes iguales.", "Anoto cada resultado — la próxima persona debe poder repetirlo."] }
    ]
  },
  {
    id: "data", cls: "cs-scene--data",
    props: `<div class="prop prop-bigmon"><span class="bar"></span><span class="bar"></span><span class="bar"></span>
      <span class="bar"></span><span class="bar"></span></div>`,
    actors: [
      { pose: "pose-point", acc: "acc-visor", outfit: "outfit-navy", role: "Analista de datos",
        say: ["Esta gráfica va a decidir qué contenido llega primero a cada persona.", "Cada barra representa una comunidad de práctica creciendo.", "Estoy buscando el patrón que conecta biblioteca, revista y talleres.", "Los datos, bien leídos, construyen la mejor red de sabiduría."] }
    ]
  },
  {
    id: "write", cls: "cs-scene--write",
    props: `<div class="prop prop-typewriter"><div class="prop-typewriter__paper"></div><div class="prop-typewriter__body"></div></div>`,
    actors: [
      { pose: "pose-write", tool: "tool-pen", acc: "acc-glasses", outfit: "outfit-burgundy", role: "Escritora",
        say: ["Este capítulo explica cómo una comunidad se vuelve una sola voz.", "Tacho, reescribo, y queda mejor cada vez.", "Cada palabra tiene que merecer el lugar en la página.", "Esta es la obra que va a presentar la Revista Académica."] }
    ]
  },
  {
    id: "paint", cls: "cs-scene--paint",
    props: `<div class="prop prop-easel"><div class="prop-easel__canvas">
      <span class="stroke"></span><span class="stroke"></span><span class="stroke"></span></div>
      <div class="prop-easel__leg prop-easel__leg--l"></div><div class="prop-easel__leg prop-easel__leg--r"></div></div>`,
    actors: [
      { pose: "pose-paint", tool: "tool-brush", acc: "acc-beret", outfit: "outfit-cream", role: "Pintora",
        say: ["Cada trazo es un módulo nuevo tomando color.", "Estoy pintando cómo se ve una comunidad que aprende junta.", "El rojo y el azul de siempre, mezclados con algo nuevo.", "Cuando la vean terminada, van a querer ser parte de esto."] }
    ]
  },
  {
    id: "farm", cls: "cs-scene--farm",
    props: `<div class="prop prop-field">
      <div class="sprout"></div><div class="sprout"></div><div class="sprout"></div>
      <div class="sprout"></div><div class="sprout"></div></div>`,
    actors: [
      { pose: "pose-till", tool: "tool-hoe", acc: "acc-cap", outfit: "outfit-olive", role: "Agricultor",
        say: ["Cada semilla es una idea que alguien va a cosechar después.", "Esta tierra va a alimentar a las mejores mentes del futuro.", "No hay atajos para hacer crecer una buena comunidad.", "Riego esto todos los días, como quien cuida un proyecto de verdad."] }
    ]
  },
  {
    id: "cook", cls: "cs-scene--cook",
    props: `<div class="prop prop-stove"><span class="steam"></span><span class="steam"></span><span class="steam"></span>
      <div class="prop-stove__pot"></div><div class="flame"></div><div class="prop-stove__body"></div></div>`,
    actors: [
      { pose: "pose-stir", tool: "tool-ladle", acc: "acc-toque", outfit: "outfit-cream", role: "Chef",
        say: ["El secreto está en dejar que todo se integre a fuego lento.", "Una pizca de biblioteca, otra de comunidad, y a revolver.", "Esto no sale de una receta — sale de años de práctica.", "Cuando lo prueben, van a pedir la receta completa."] }
    ]
  },
  {
    id: "bridge", cls: "cs-scene--bridge",
    props: `<div class="prop prop-bridge">
      <div class="prop-bridge__tower prop-bridge__tower--l"><span class="prop-bridge__tag">BETA</span></div>
      <div class="prop-bridge__tower prop-bridge__tower--r"><span class="prop-bridge__tag">PRODUCTION</span></div>
      <div class="prop-bridge__girder"></div><div class="prop-bridge__rivet"></div></div>`,
    actors: [
      { pose: "pose-hammer", tool: "tool-hammer", sparks: true, acc: "acc-hardhat", outfit: "outfit-orange", role: "Constructor",
        say: ["Cada remache es un cambio que ya se probó en beta.", "Este puente es lo que separa un experimento de algo real.", "Nada cruza a producción sin pasar antes por acá.", "Firme, remache a remache, hasta que aguante cualquier tráfico."] },
      { pose: "pose-hammer", tool: "tool-hammer", sparks: true, acc: "acc-hardhat--cyan", outfit: "outfit-navy", role: "Constructora",
        say: ["Del otro lado ya está esperando community.centrocultural.cr.", "Revisamos dos veces antes de dejar pasar cualquier cambio.", "Este puente lo cruzan datos de personas reales — se construye con cuidado.", "Cuando esté listo, nadie va a notar la costura."] }
    ]
  },
  {
    id: "stars", cls: "cs-scene--stars",
    props: `<div class="prop prop-scope"><div class="moon"></div>
      <div class="prop-scope__tube"></div>
      <div class="prop-scope__leg"></div><div class="prop-scope__leg"></div><div class="prop-scope__leg"></div></div>`,
    actors: [
      { pose: "pose-scan", acc: "acc-headscarf", outfit: "outfit-navy", role: "Exploradora",
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
    <div class="cs-scene__sky">${isStars ? starsHTML(12) : ""}</div>
    ${scene.props}
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
