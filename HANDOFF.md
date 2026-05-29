# Content Intel — Handoff

Proyecto para transcribir y analizar vídeos e imágenes de redes sociales via WhatsApp Business, y mostrarlos en un dashboard personal.

---

## Qué es esto

Bot de WhatsApp Business que recibe:
- **URLs de vídeo** (Instagram Reels, YouTube, TikTok) → yt-dlp descarga audio → Groq Whisper transcribe → Claude analiza
- **Screenshots/imágenes** (posts de texto, carruseles) → Claude Vision analiza directamente

Guarda los insights en Supabase y los muestra en un dashboard Next.js con branding Fidely.

---

## Dos proyectos separados

| Proyecto | Ruta local | Deploy |
|---------|-----------|--------|
| **Procesador** | `Desktop/04-Proyectos/content-intel-processor/` | Easypanel (`automatizaciones` project) |
| **Dashboard** | `Desktop/04-Proyectos/content-intel-dashboard/` | Vercel: https://content-intel-dashboard-gray.vercel.app |

---

## Estado actual (2026-05-29) — TODO COMPLETADO ✅

### ✅ Hecho
- [x] Task 1: Tabla `content_insights` en Supabase (proyecto fidelity `vpoauhbflmexrnlahkgy`) ✅
- [x] Tasks 2-9: Todo el código del procesador (20/20 tests pasando)
- [x] Task 10: Dockerfile corregido (Node 22-slim, src no excluido en .dockerignore)
- [x] Tasks 11-16: Dashboard completo deployado en Vercel ✅
- [x] Repo GitHub: https://github.com/mtelloe/content-intel-processor (público)
- [x] Deploy en Easypanel via Docker Swarm (SSH + deploy_key) ✅
- [x] Webhook Evolution API configurado → `automatizaciones-content-intel-processor.hjbrvj.easypanel.host/webhook/whatsapp` ✅
- [x] Fix imágenes: si Evolution API no envía base64 en webhook, el procesador lo descarga via `/chat/getBase64FromMediaMessage` ✅
- [x] Health check: `{"status":"ok"}` HTTP 200 ✅

### Dominio del servicio
```
https://automatizaciones-content-intel-processor.hjbrvj.easypanel.host
```

### Para redeploy futuro (si cambias código)
```bash
# En el servidor:
ssh -i ~/.ssh/deploy_key root@hjbrvj.easypanel.host

TMPDIR=$(mktemp -d)
git clone https://github.com/mtelloe/content-intel-processor.git $TMPDIR/app
cd $TMPDIR/app && docker build -t automatizaciones_content-intel-processor:latest .
docker service update --image automatizaciones_content-intel-processor:latest automatizaciones_content-intel-processor
rm -rf $TMPDIR
```

### Notas de producción
- WhatsApp instancia: `+34 682 355 001` (maria-personal en Evolution API)
- Cookies Instagram: `/etc/easypanel/projects/automatizaciones/content-intel-processor/cookies/instagram.txt` — renovar si dejan de funcionar
- GROQ y Anthropic keys rotan — si da 401, generar nuevas en console.groq.com y console.anthropic.com

---

## Cómo retomar

Di simplemente: **"continúa con Content Intel"**

---

## Stack técnico

**Procesador (Easypanel):**
- Node.js/TypeScript ESM + Express
- yt-dlp + ffmpeg (en Docker)
- groq-sdk (Whisper large-v3-turbo)
- @anthropic-ai/sdk claude-haiku-4-5 (análisis + Vision)
- @supabase/supabase-js (service role)

**Dashboard (Vercel):**
- Next.js 16 App Router
- Instrument Serif + Inter Tight (branding Fidely)
- Colores: fondo `#F8F6F1`, acento `#FF2D6F`
- Contraseña: `content123`

---

## Infra

- Supabase: proyecto fidelity `vpoauhbflmexrnlahkgy`
- Evolution API: `evolutionapi-evolution-api.hjbrvj.easypanel.host`
- Easypanel: `hjbrvj.easypanel.host` → proyecto `automatizaciones`
- Dashboard Vercel: https://content-intel-dashboard-gray.vercel.app
- Repo procesador: https://github.com/mtelloe/content-intel-processor
- Repo dashboard: https://github.com/mtelloe/content-intel-dashboard
