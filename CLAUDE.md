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
  `web/shared/ds/assets/fonts/`. No enlaces Google Fonts ni ninguna librería por CDN.
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

No hay build ni pruebas automatizadas todavía (sitio estático). Antes de un cambio,
abrir `web/index.html` con un servidor local (ver `README.md`) y confirmar visualmente
que el logo enlaza al sitio oficial, que el wordmark anima, y que la consola del
navegador no muestra errores de CSP.
