# Desplegar PRODUCTION en Azure Static Web Apps

Pasos manuales (una sola vez), en el portal de Azure — no hay `az` CLI disponible en este
entorno de desarrollo. Misma familia de servicio que `A - API/NCTE`
(`community.centrocultural.cr` en vez de `ncte.centrocultural.cr`).

## 1. Crear el Static Web App

Azure Portal → **Create a resource → Static Web App**:

- **Nombre:** `cccn-community` (o el que prefieras).
- **Plan:** Free (alcanza de sobra para un landing estático).
- **Deployment source:** GitHub → autorizar → repo `jabib-h/CCCN_Community_PRODUCTION`,
  rama `main`.
- **Build details:**
  - Build presets: `Custom`
  - App location: `/web`
  - Api location: *(vacío — no hay backend)*
  - Output location: *(vacío — sin build)*

Al crear el recurso, Azure genera automáticamente el workflow de GitHub Actions
(`.github/workflows/azure-static-web-apps-<nombre>.yml`) y el secreto
`AZURE_STATIC_WEB_APPS_API_TOKEN` en el repo — no hace falta escribirlos a mano (así
funciona también NCTE). Cada push a `main` despliega solo.

## 2. Verificar el primer deploy

El workflow tarda 2–4 minutos. Confirmar:

```bash
curl -sI https://<nombre-generado>.azurestaticapps.net/
```

Debe traer `Content-Security-Policy` sin `unsafe-inline`, `Strict-Transport-Security`,
`X-Frame-Options: DENY` (vienen de `staticwebapp.config.json`, no hace falta configurarlos
en el portal).

## 3. Dominio propio

**Static Web App → Custom domains → + Add** → `community.centrocultural.cr` → Azure pide
un registro `TXT` (validación) y luego `CNAME` (o `ALIAS`/`ANAME` si el registrador de
`centrocultural.cr` no soporta CNAME en la raíz) apuntando al hostname
`*.azurestaticapps.net` del recurso. El certificado TLS lo emite y renueva Azure solo, sin
pasos extra, una vez el DNS resuelve.

## 4. Promoción desde BETA

Este repo no recibe cambios de diseño ni módulos nuevos directamente — se promueven desde
[`CCCN_Community_BETA`](https://github.com/jabib-h/CCCN_Community_BETA) uno por uno,
cuando estén listos para el público (ver `CLAUDE.md`):

```bash
git remote add beta https://github.com/jabib-h/CCCN_Community_BETA.git
git fetch beta main
git checkout beta/main -- <ruta-del-módulo-a-promover>
git push origin main        # dispara el deploy automático
```

Si el módulo que se promueve trae backend (por ejemplo, cuando el Hub completo pase a
producción), ese es el momento de decidir Static Web Apps + Functions vs. un servicio
aparte (App Service/Container Apps) — no antes. Esa decisión se documenta en este archivo
cuando se tome.
