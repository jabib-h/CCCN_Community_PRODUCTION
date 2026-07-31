"use strict";
/* Obra en construcción: escenas de personajes (stick figures) generadas por datos.
   Todo el estilo dinámico va por clases — nunca por atributo style en el HTML (CSP:
   style-src 'self'). Las posiciones aleatorias de estrellas sí usan CSSOM (element.style
   desde JS), que es el mecanismo permitido — ver CLAUDE.md. */

function actorHTML(a) {
  const sparks = a.sparks ? '<span class="spark"></span><span class="spark"></span><span class="spark"></span>' : "";
  const tool = a.tool ? `<span class="tool ${a.tool}">${sparks}</span>` : "";
  return `
  <div class="actor ${a.pos}" data-dialogues='${JSON.stringify(a.say)}' tabindex="0" role="button"
       aria-label="${a.role}">
    <div class="bubble"></div>
    <div class="rig ${a.pose}">
      <div class="rig__leg rig__leg--l"></div>
      <div class="rig__leg rig__leg--r"></div>
      <div class="rig__torso"></div>
      <div class="rig__arm rig__arm--l"></div>
      <div class="rig__arm rig__arm--r">${tool}</div>
      <div class="rig__head">${a.acc ? `<span class="acc ${a.acc}"></span>` : ""}</div>
    </div>
  </div>`;
}

const SCENES = [
  {
    id: "weld", cls: "cs-scene--weld", label: "01 · Soldando la estructura",
    props: `<div class="prop prop-frame">
      <div class="prop-frame__bar prop-frame__bar--v1"></div><div class="prop-frame__bar prop-frame__bar--v2"></div>
      <div class="prop-frame__bar prop-frame__bar--h1"></div><div class="prop-frame__bar prop-frame__bar--h2"></div>
      <div class="prop-frame__bar prop-frame__bar--x1"></div><div class="prop-frame__bar prop-frame__bar--x2"></div>
      <div class="prop-frame__chip">COMMUNITY</div></div>`,
    actors: [
      { pos: "pos-1", pose: "pose-weld", acc: "acc-hardhat", tool: "tool-torch", sparks: true, role: "Soldador",
        say: ["Una junta más y la viga de la Comunidad de Práctica queda firme.", "¡Cuidado con las chispas, esto va a quedar sólido!", "Estamos soldando lo que va a sostener cinco módulos a la vez.", "Cada punto de soldadura es una promesa que no se puede romper."] },
      { pos: "pos-3", pose: "pose-weld", acc: "acc-hardhat", tool: "tool-torch", sparks: true, role: "Soldadora",
        say: ["Este lado ya aguanta el peso de la Revista Académica.", "Firme, derecho, sin atajos — así se construye confianza.", "Falta poco para que esto se vea desde community.centrocultural.cr.", "La estructura crece más rápido cuando trabajamos en equipo."] },
      { pos: "pos-5", pose: "pose-point", acc: "acc-hardhat--cyan", role: "Supervisora",
        say: ["Revisen esa unión antes de seguir, no hay prisa que valga.", "Así me gusta: cada pieza en su lugar, cada dato protegido.", "Esto lo construimos para que dure generaciones de estudiantes.", "Buen trabajo — la base ya soporta toda la plataforma."] }
    ]
  },
  {
    id: "code", cls: "cs-scene--code", label: "02 · Programando la plataforma",
    props: `<div class="prop prop-desk"><div class="prop-desk__monitor">
      <div class="prop-desk__line"></div><div class="prop-desk__line"></div><div class="prop-desk__line"></div>
      <span class="prop-desk__cursor"></span></div><div class="prop-desk__top"></div></div>`,
    actors: [
      { pos: "pos-1", pose: "pose-type", acc: "acc-glasses", role: "Programador",
        say: ["Estoy afinando el control de acceso, nadie entra sin permiso.", "Un módulo menos en construcción, cuatro por terminar.", "Este commit deja la bitácora a prueba de manipulaciones.", "Escribo código pensando en quien lo va a leer en tres años."] },
      { pos: "pos-3", pose: "pose-type", acc: "acc-glasses", role: "Programadora",
        say: ["Estoy probando que ningún dato de menores se filtre.", "Cada función que escribo tiene su prueba al lado.", "La plataforma tiene que sentirse simple aunque por dentro sea compleja.", "Vamos a lanzar esto cuando esté listo, no antes."] },
      { pos: "pos-5", pose: "pose-type", acc: "acc-visor", role: "Programador",
        say: ["Estoy uniendo la biblioteca digital con el resto del sistema.", "Este código va a servir a miles de estudiantes de inglés.", "Refactorizando: menos líneas, mismas garantías de seguridad.", "Ya casi conectamos las cinco piezas del Hub."] }
    ]
  },
  {
    id: "arch", cls: "cs-scene--arch", label: "03 · Arquitectos e ingenieros revisan los planos",
    props: `<div class="prop prop-table"><div class="prop-table__paper"></div><div class="prop-table__top"></div></div>`,
    actors: [
      { pos: "pos-2", pose: "pose-lean", acc: "acc-visor", tool: "tool-pencil", role: "Arquitecta",
        say: ["Este plano conecta la biblioteca física con la digital.", "Midamos dos veces, construyamos una sola vez.", "Cada muro que dibujo protege un dato de alguien.", "Este diseño tiene que crecer sin romperse."] },
      { pos: "pos-4", pose: "pose-point", tool: "tool-book", acc: "acc-cap", role: "Ingeniero",
        say: ["Ahí va la sala de credenciales, justo al centro del plano.", "Si lo construimos bien, dura veinte años sin remodelar.", "Este plano es la promesa de todo lo que viene.", "Firmamos este diseño con la misma seriedad que un edificio real."] }
    ]
  },
  {
    id: "magic", cls: "cs-scene--magic", label: "04 · El mago prepara la poción",
    props: `<div class="prop prop-cauldron"><span class="bub"></span><span class="bub"></span><span class="bub"></span>
      <div class="prop-cauldron__glow"></div><div class="prop-cauldron__pot"></div></div>`,
    actors: [
      { pos: "pos-3", pose: "pose-stir", acc: "acc-hat-wizard", tool: "tool-ladle", role: "Mago",
        say: ["Una pizca de comunidad, dos cucharadas de conocimiento.", "Esta poción convierte datos sueltos en sabiduría compartida.", "Cuidado: lo que hierve ahí adentro va a sorprender a todos.", "La magia real es que cinco servicios funcionen como uno solo."] }
    ]
  },
  {
    id: "lab", cls: "cs-scene--lab", label: "05 · El científico analiza los resultados",
    props: `<div class="prop prop-lab"><div class="beaker"><div class="beaker__liq"></div></div>
      <div class="beaker"><div class="beaker__liq"></div></div><div class="beaker"><div class="beaker__liq"></div></div>
      <div class="prop-lab__bench"></div></div>`,
    actors: [
      { pos: "pos-3", pose: "pose-dip", acc: "acc-glasses", tool: "tool-pipette", role: "Científica",
        say: ["Esta muestra confirma que el cifrado aguanta la prueba.", "Repito el experimento hasta que no quede duda alguna.", "La fórmula exacta: seguridad más simplicidad, en partes iguales.", "Anoto cada resultado — la próxima persona debe poder repetirlo."] }
    ]
  },
  {
    id: "data", cls: "cs-scene--data", label: "06 · La analista de datos traza la red del conocimiento",
    props: `<div class="prop prop-bigmon"><span class="bar"></span><span class="bar"></span><span class="bar"></span>
      <span class="bar"></span><span class="bar"></span></div>`,
    actors: [
      { pos: "pos-3", pose: "pose-point", acc: "acc-visor", role: "Analista de datos",
        say: ["Esta gráfica va a decidir qué contenido llega primero a cada persona.", "Cada barra representa una comunidad de práctica creciendo.", "Estoy buscando el patrón que conecta biblioteca, revista y talleres.", "Los datos, bien leídos, construyen la mejor red de sabiduría."] }
    ]
  },
  {
    id: "write", cls: "cs-scene--write", label: "07 · La escritora redacta la obra más importante",
    props: `<div class="prop prop-typewriter"><div class="prop-typewriter__paper"></div><div class="prop-typewriter__body"></div></div>`,
    actors: [
      { pos: "pos-3", pose: "pose-write", tool: "tool-pen", acc: "acc-glasses", role: "Escritora",
        say: ["Este capítulo explica cómo una comunidad se vuelve una sola voz.", "Tacho, reescribo, y queda mejor cada vez.", "Cada palabra tiene que merecer el lugar en la página.", "Esta es la obra que va a presentar la Revista Académica."] }
    ]
  },
  {
    id: "paint", cls: "cs-scene--paint", label: "08 · La pintora crea la obra más importante del mundo",
    props: `<div class="prop prop-easel"><div class="prop-easel__canvas">
      <span class="stroke"></span><span class="stroke"></span><span class="stroke"></span></div>
      <div class="prop-easel__leg prop-easel__leg--l"></div><div class="prop-easel__leg prop-easel__leg--r"></div></div>`,
    actors: [
      { pos: "pos-3", pose: "pose-paint", tool: "tool-brush", acc: "acc-beret", role: "Pintora",
        say: ["Cada trazo es un módulo nuevo tomando color.", "Estoy pintando cómo se ve una comunidad que aprende junta.", "El rojo y el azul de siempre, mezclados con algo nuevo.", "Cuando la vean terminada, van a querer ser parte de esto."] }
    ]
  },
  {
    id: "farm", cls: "cs-scene--farm", label: "09 · El agricultor siembra los frutos del futuro",
    props: `<div class="prop prop-field">
      <div class="sprout"></div><div class="sprout"></div><div class="sprout"></div>
      <div class="sprout"></div><div class="sprout"></div></div>`,
    actors: [
      { pos: "pos-3", pose: "pose-till", tool: "tool-hoe", acc: "acc-cap", role: "Agricultor",
        say: ["Cada semilla es una idea que alguien va a cosechar después.", "Esta tierra va a alimentar a las mejores mentes del futuro.", "No hay atajos para hacer crecer una buena comunidad.", "Riego esto todos los días, como quien cuida un proyecto de verdad."] }
    ]
  },
  {
    id: "cook", cls: "cs-scene--cook", label: "10 · El chef cocina el mejor platillo jamás hecho",
    props: `<div class="prop prop-stove"><span class="steam"></span><span class="steam"></span><span class="steam"></span>
      <div class="prop-stove__pot"></div><div class="flame"></div><div class="prop-stove__body"></div></div>`,
    actors: [
      { pos: "pos-3", pose: "pose-stir", tool: "tool-ladle", acc: "acc-toque", role: "Chef",
        say: ["El secreto está en dejar que todo se integre a fuego lento.", "Una pizca de biblioteca, otra de comunidad, y a revolver.", "Esto no sale de una receta — sale de años de práctica.", "Cuando lo prueben, van a pedir la receta completa."] }
    ]
  },
  {
    id: "bridge", cls: "cs-scene--bridge", label: "11 · Construyendo el puente entre beta y producción",
    props: `<div class="prop prop-bridge">
      <div class="prop-bridge__tower prop-bridge__tower--l"><span class="prop-bridge__tag">BETA</span></div>
      <div class="prop-bridge__tower prop-bridge__tower--r"><span class="prop-bridge__tag">PRODUCTION</span></div>
      <div class="prop-bridge__girder"></div><div class="prop-bridge__rivet"></div></div>`,
    actors: [
      { pos: "pos-2", pose: "pose-hammer", tool: "tool-hammer", sparks: true, acc: "acc-hardhat", role: "Constructor",
        say: ["Cada remache es un cambio que ya se probó en beta.", "Este puente es lo que separa un experimento de algo real.", "Nada cruza a producción sin pasar antes por acá.", "Firme, remache a remache, hasta que aguante cualquier tráfico."] },
      { pos: "pos-4", pose: "pose-hammer", tool: "tool-hammer", sparks: true, acc: "acc-hardhat--cyan", role: "Constructora",
        say: ["Del otro lado ya está esperando community.centrocultural.cr.", "Revisamos dos veces antes de dejar pasar cualquier cambio.", "Este puente lo cruzan datos de personas reales — se construye con cuidado.", "Cuando esté listo, nadie va a notar la costura."] }
    ]
  },
  {
    id: "stars", cls: "cs-scene--stars", label: "12 · La exploradora traza el mapa del conocimiento",
    props: `<div class="prop prop-scope"><div class="moon"></div>
      <div class="prop-scope__tube"></div>
      <div class="prop-scope__leg"></div><div class="prop-scope__leg"></div><div class="prop-scope__leg"></div></div>`,
    actors: [
      { pos: "pos-3", pose: "pose-scan", acc: "acc-headscarf", role: "Exploradora",
        say: ["Ahí arriba hay tantas ideas como estrellas por conectar.", "Estoy trazando el mapa que va a guiar a quien llegue después.", "Cada punto de luz es una persona más aprendiendo con nosotros.", "Todavía no está completo el mapa, pero ya se ve el camino."] }
    ]
  }
];

function starsHTML(n) {
  let out = "";
  for (let i = 0; i < n; i++) out += '<span class="star"></span>';
  return out;
}

function buildScene(scene) {
  const el = document.createElement("section");
  el.className = "cs-scene " + scene.cls;
  el.setAttribute("aria-label", scene.label);
  const isStars = scene.id === "stars";
  el.innerHTML = `
    <div class="cs-scene__tape"></div>
    <div class="cs-scene__sky">${isStars ? starsHTML(14) : ""}</div>
    ${scene.props}
    ${scene.actors.map(actorHTML).join("")}
    <div class="cs-scene__ground"></div>
    <p class="cs-scene__label">${scene.label}</p>
    <p class="cs-scene__hint">Toca a cada personaje</p>
  `;
  if (isStars) {
    el.querySelectorAll(".star").forEach((s) => {
      s.style.left = Math.round(8 + Math.random() * 84) + "%";
      s.style.top = Math.round(6 + Math.random() * 55) + "%";
      s.style.animationDelay = (Math.random() * 2.4).toFixed(2) + "s";
    });
  }
  return el;
}

function initConstructionSite() {
  const rail = document.getElementById("cs-rail");
  const dots = document.getElementById("cs-dots");
  if (!rail || !dots) return;

  SCENES.forEach((scene) => rail.appendChild(buildScene(scene)));

  SCENES.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "cs-dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", "Ir a la escena " + (i + 1));
    dot.addEventListener("click", () => {
      rail.children[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
    dots.appendChild(dot);
  });

  const dotEls = Array.from(dots.children);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Array.from(rail.children).indexOf(entry.target);
          dotEls.forEach((d, i) => d.classList.toggle("is-active", i === idx));
        }
      });
    },
    { root: rail, threshold: 0.6 }
  );
  Array.from(rail.children).forEach((stage) => observer.observe(stage));

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
    bubble.classList.add("is-visible");
    clearTimeout(actorEl._hideTimer);
    actorEl._hideTimer = setTimeout(() => bubble.classList.remove("is-visible"), 3400);
  }

  rail.addEventListener("click", (e) => {
    const actorEl = e.target.closest(".actor");
    if (actorEl) speak(actorEl);
  });
  rail.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const actorEl = e.target.closest(".actor");
    if (actorEl) { e.preventDefault(); speak(actorEl); }
  });
}

document.addEventListener("DOMContentLoaded", initConstructionSite);
