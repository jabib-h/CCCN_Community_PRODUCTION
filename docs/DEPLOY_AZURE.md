# Desplegar PRODUCTION en Azure App Service

Pasos manuales (una sola vez). Requieren el portal de Azure o `az` CLI en una máquina que
lo tenga instalado — no está disponible en este entorno de desarrollo.

## 1. Base de datos (Postgres)

**Pendiente decidir** (ver `ARQUITECTURA.md` §8): Azure Database for PostgreSQL Flexible
Server, o reusar el mismo proyecto Supabase que beta con una base separada. Cualquiera
de las dos sirve — el esquema es portable (SQLAlchemy Core, sin nada específico de
dialecto fuera de los bloques marcados en `api/db.py`). Con Azure Flexible Server:

```bash
az postgres flexible-server create \
  --resource-group cccn-rg \
  --name cccn-community-db \
  --location eastus \
  --admin-user cccnadmin \
  --admin-password '<generar-uno-fuerte>' \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 16 \
  --storage-size 32
az postgres flexible-server db create --resource-group cccn-rg \
  --server-name cccn-community-db --database-name hub
```

Anotar el connection string para el paso 3. `sslmode=require` siempre.

## 2. App Service

```bash
az appservice plan create --resource-group cccn-rg --name cccn-community-plan \
  --sku B1 --is-linux
az webapp create --resource-group cccn-rg --plan cccn-community-plan \
  --name cccn-community --runtime "PYTHON:3.12"
```

**Configuration → General settings → Startup Command:**

```
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

*(un solo worker uvicorn — suficiente para una instancia B1; si el tráfico lo exige,
escalar con más instancias del App Service en vez de multi-proceso local, para no
reintroducir estado en memoria — ver la nota de `rate_limiter` en
`api/security.py`.)*

## 3. Variables de entorno y secretos

**Configuration → Application settings** (o Key Vault + referencias `@Microsoft.KeyVault(...)`
para los secretos — recomendado, ver Panorama Legal Paso 1). Cargar todo lo listado en
`.env.example`, en particular:

- `HUB_ENV=production`
- `HUB_BASE_URL=https://community.centrocultural.cr`
- `HUB_DATABASE_URL` (paso 1, con `+psycopg` en el esquema)
- `HUB_JWT_SECRET`, `HUB_SESSION_SECRET` — generar con
  `python -c "import secrets; print(secrets.token_urlsafe(48))"`, uno **distinto** para
  cada variable, nunca reusar los de beta.

## 4. CI/CD (GitHub Actions)

`.github/workflows/deploy-azure.yml` ya está en el repo: corre `smoke_tests.py` y, si
pasan, despliega a Azure con `azure/webapps-deploy` en cada push a `main`.

1. **Azure Portal → App Service → Get publish profile** (o
   `az webapp deployment list-publishing-profiles --xml`).
2. En GitHub: **Settings → Secrets and variables → Actions** →
   `AZURE_WEBAPP_PUBLISH_PROFILE` con ese contenido.
3. Ajustar `env.AZURE_WEBAPP_NAME` en el workflow si el nombre del App Service es
   distinto de `cccn-community`.

## 5. Dominio propio

**App Service → Custom domains** → agregar `community.centrocultural.cr` → seguir la
verificación TXT/CNAME que pide Azure → apuntar el DNS del dominio (registrador de
`centrocultural.cr`) al hostname `*.azurewebsites.net` del App Service. Activar
**TLS/SSL → App Service Managed Certificate** (gratis, autorrenovable) una vez el DNS
resuelva.

## 6. Verificación post-deploy

- `https://community.centrocultural.cr/health` → `{"status":"ok","env":"production"}`.
- Cabeceras: `curl -sI https://community.centrocultural.cr/` debe traer
  `Strict-Transport-Security`, `Content-Security-Policy` sin `unsafe-inline`, `nosniff`.
- Crear la primera cuenta administradora (ver `README.md`).

## 7. Promoción desde BETA

Este repo no recibe cambios de diseño directos — se promueven desde
[`CCCN_Community_BETA`](https://github.com/jabib-h/CCCN_Community_BETA) una vez
validados ahí:

```bash
git remote add beta https://github.com/jabib-h/CCCN_Community_BETA.git
git fetch beta main
git merge beta/main
python -m api.smoke_tests
git push origin main        # dispara el workflow de deploy
```
