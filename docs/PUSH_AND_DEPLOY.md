# Cómo hacer el primer push a GitHub y deploy en Render

## 1. Push inicial a GitHub

Abre una terminal en `C:\Users\Leo\Documents\rentasmxxx` y ejecuta:

```sh
git init
git branch -M main
git remote add origin https://github.com/leodstar4/startuprentasmx.git
git add .
git commit -m "feat: Renta MX demo — monolito Python, corpus CDMX+Federal, 69 reqs verificados"
git push -u origin main
```

> Si ya tenías un `git init` previo: salta el primer comando. Si pide credenciales de GitHub,
> usa un Personal Access Token (Settings → Developer settings → Tokens → classic).

---

## 2. Deploy en Render (gratis, demo)

1. Ve a https://render.com y entra con tu cuenta.
2. **New → Web Service** → conecta tu repositorio `startuprentasmx`.
3. Render detectará el `render.yaml` automáticamente. Confirma la configuración.
4. En **Environment Variables**, agrega manualmente (no están en el YAML por seguridad):
   - `MX_IP_SALT` → cualquier string aleatorio largo (ej. `openssl rand -hex 32` en terminal)
   - `DATABASE_URL` → **opcional para la demo** (sin ella los datos son efímeros; con ella persisten)
5. Clic en **Deploy**. El primer build tarda ~3-5 min (instala deps + corre `mx.verify` + build frontend).
6. Cuando termine, Render te da una URL como `https://renta-mx-demo.onrender.com`.

---

## 3. Configurar Supabase (opcional, para que los datos persistan)

Sin `DATABASE_URL` los listings y contratos se pierden al reiniciar (plan free duerme).
Para persistencia:

1. Crea proyecto gratis en https://supabase.com
2. **Settings → Database → Connection string → URI** → copia la cadena
3. En Render → tu servicio → **Environment** → agrega `DATABASE_URL` = la cadena copiada
4. Redeploy. Listo — los datos ya no se pierden.

---

## 4. Verificar que funciona

Visita:
- `https://<tu-url>.onrender.com/health` → debe devolver `{"status":"ok","mx_data":true}`
- `https://<tu-url>.onrender.com/mx/health` → debe devolver el health de la API MX
- `https://<tu-url>.onrender.com/` → la app completa con el banner de demo

> ⚠️ El plan free de Render **duerme tras 15 min de inactividad**. El primer request tarda ~1 min
> en despertar. Para producción real: cambiar a Render Starter (~$7/mes).

---

## 5. Para producción completa (cuando estés listo)

Solo cambia estas variables en Render:
- Elimina `MX_DATA_DIR` y `MX_CORPUS_DIR` → usará `data/mx` y `corpus_mx` completos (229 reqs)
- Cambia `plan: free` a `plan: starter` en `render.yaml` → siempre encendido, 2 GB RAM

Sin tocar una línea de código.
