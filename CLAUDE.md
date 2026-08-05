# CLAUDE.md — Reglas de desarrollo · CCCN Community (PRODUCTION)

Este repo hoy es **solo el landing "próximamente"** (ver `README.md`). No tiene backend,
base de datos ni las reglas de RBAC/auditoría/Ley 8968 del Hub completo — esas viven en
[`CCCN_Community_BETA`](https://github.com/jabib-h/CCCN_Community_BETA) y se promueven
acá módulo por módulo cuando estén listos para el público. No traigas código del Hub para
acá "por si acaso": si un módulo no está promovido todavía, no pertenece a este repo.

## Reglas duras (aplican mientras el sitio sea estático)

- **CSP sin `unsafe-inline`** (`staticwebapp.config.json`): cero `style=""`, cero
  `<style>`/`<script>` embebido. Color o posición dinámica → CSSOM desde `.js`
  (`el.style.propiedad = ...`), nunca por atributo en el HTML.
- **Sin `font-src` externo, sin CDN.** La tipografía vive autoalojada en
  `web/shared/ds/assets/fonts/` (Raleway + Fraunces itálica). No enlaces Google Fonts ni
  ninguna librería por CDN. `Fraunces-OFL.txt` acompaña al `.woff2` por licencia (OFL 1.1).
- **`script-src 'none'`**: hoy la landing no tiene JS. Si agregás JS, abrí la directiva en
  `staticwebapp.config.json` en el mismo cambio o la página se rompe en silencio.
- **El wordmark "Community" es una sola palabra y no puede reflowear.** Su `font-size`
  tiene que seguir escalando con `vw` hasta el mínimo (medido: la palabra ocupa 5.31× el
  font-size); subir ese mínimo la desborda en pantallas de 320px. Verificalo antes de
  tocarlo, no lo ajustes a ojo.
- `web/shared/ds/` es la ÚNICA copia del design system (tokens, tipografía, componentes).
  No dupliques colores, logos ni fuentes en otra carpeta — si falta algo, se agrega ahí.
- Español en todo el contenido, salvo acentos de marca cortos y deliberados ya existentes
  (el tagline en inglés del hero).
- Marcá cualquier simplificación deliberada con un comentario `ponytail:` que nombre el
  techo de la solución y su camino de mejora.

## Antes de promover un módulo desde BETA

1. Que ya esté validado en beta (Vercel + Supabase) con sus pruebas pasando.
2. Traer solo ese módulo — no arrastrar todo `api/` de vuelta "por si se necesita".
3. Si el módulo trae backend, ese es el momento de decidir cómo corre en Azure (Static
   Web Apps + Functions vs. un App Service aparte) — no antes.
4. Actualizar `staticwebapp.config.json` y `docs/DEPLOY_AZURE.md` en el mismo cambio.

## Verificación

No hay build ni pruebas automatizadas todavía (sitio estático). Antes de un cambio, servir
`web/` en local (ver `README.md`) y confirmar que el logo enlaza al sitio oficial, que el
wordmark carga en Fraunces (no en un serif de respaldo) y que la consola no muestra
errores de CSP.

Para revisar el diseño de verdad, renderizalo — no lo des por bueno leyendo el CSS:

```bash
chrome --headless=new --disable-gpu --hide-scrollbars \
  --virtual-time-budget=7000 --window-size=1440,900 \
  --screenshot=out.png http://localhost:8080/
```

Ojo: headless no baja de ~504px de ancho de viewport, así que para probar teléfonos hay
que cargar la página dentro de un `<iframe width="320">` en una página de prueba temporal
(los `vw` resuelven contra el ancho del iframe) y comparar `scrollWidth` con
`clientWidth`. Así se detectó el desborde del wordmark en 320px.
