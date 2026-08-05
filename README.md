# CCCN Community (PRODUCTION)

Landing "próximamente" de **community.centrocultural.cr**. Sitio 100% estático — sin
backend, sin base de datos, sin build — pensado para desplegarse en **Azure Static Web
Apps** con la misma estructura que `A - API/NCTE` (`staticwebapp.config.json`, cabeceras
de seguridad, sin GitHub Action escrita a mano: Azure la genera al conectar el repo).

## Por qué este repo está tan vacío

Este es literalmente **todo lo que necesita el landing inicial**. La plataforma completa
(FastAPI + Postgres, comunidad de práctica, revista, biblioteca, credenciales) vive y se
prueba en [`CCCN_Community_BETA`](https://github.com/jabib-h/CCCN_Community_BETA) y **no
se trae para acá todavía**. Cuando un módulo esté listo para producción, se promueve
explícitamente (ver `docs/DEPLOY_AZURE.md` §4) — hasta entonces este repo se mantiene
mínimo a propósito, no por descuido.

## Estructura

```
CCCN_Community_PRODUCTION/
├── staticwebapp.config.json   Cabeceras de seguridad + fallback de rutas (Azure SWA)
├── docs/DEPLOY_AZURE.md       Cómo crear el Static Web App y apuntar el dominio
└── web/                       Todo el sitio — carpeta raíz de la app en Azure SWA
    ├── index.html             Landing: logo (enlaza al sitio oficial) + wordmark "Community"
    ├── coming-soon.css        Estilos de la landing (glow/chispas en CSS puro, sin JS)
    └── shared/
        ├── img/                logo.png, logo-white.png
        └── ds/                 FUENTE ÚNICA DE MARCA: tokens, tipografía autoalojada, componentes
```

## Ver en local

Cualquier servidor estático sirve. Por ejemplo:

```bash
python -m http.server 8080 --directory web
```

Abrir `http://localhost:8080/`.

## Reglas al tocar este sitio

- **Cero `style=""` y cero `<script>`/`<style>` inline.** La CSP de
  `staticwebapp.config.json` no tiene `unsafe-inline`. Si necesitás algo dinámico, hacelo
  por CSSOM desde `.js` (`elemento.style.propiedad = ...`), nunca por atributo en el HTML.
- **Sin Google Fonts ni CDN.** La tipografía está autoalojada en
  `web/shared/ds/assets/fonts/`; la CSP no permite `font-src` externo. Son dos: Raleway
  (texto) y Fraunces itálica (solo el wordmark, vía el tratamiento `.real-tag`). Fraunces
  es SIL OFL 1.1 y su licencia viaja al lado del archivo (`Fraunces-OFL.txt`) — no la
  borres, es requisito de la licencia para redistribuirla.
- **No hay JavaScript** y la CSP lo bloquea (`script-src 'none'`). Si algún día hace falta
  JS, hay que abrir esa directiva en `staticwebapp.config.json` en el mismo cambio.
- `web/shared/ds/` es la única copia del design system — no dupliques tokens, logos ni
  tipografías en otra carpeta.
- Contenido en español (excepción: acentos de marca cortos y deliberados, como el tagline
  en inglés del hero).
