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
| **Procesador** (este repo) | `Desktop/04-Proyectos/content-intel-processor/` | Easypanel |
| **Dashboard** | `Desktop/04-Proyectos/content-intel-dashboard/` | Vercel |

---

## Documentos de diseño

- **Spec completo:** `Desktop/04-Proyectos/docs/superpowers/specs/2026-05-29-content-intel-design.md`
- **Plan de implementación (16 tareas):** `Desktop/04-Proyectos/docs/superpowers/plans/2026-05-29-content-intel.md`

---

## Estado actual (2026-05-29)

### ✅ Hecho
- [x] Task 1: Migration SQL creada en `supabase/migrations/001_content_insights.sql` — **PENDIENTE aplicar en Supabase**

### ⏳ Pendiente — Procesador (Easypanel)
- [ ] Task 2: Scaffold (package.json, tsconfig.json, src/types.ts, .env.example)
- [ ] Task 3: src/supabase.ts — cliente con saveInsight, saveError, isDuplicate
- [ ] Task 4: src/downloader.ts — wrapper yt-dlp + tests
- [ ] Task 5: src/transcriber.ts — Groq Whisper + tests
- [ ] Task 6: src/analyzer.ts — Claude texto + Vision + tests
- [ ] Task 7: src/whatsapp.ts — Evolution API reply sender + tests
- [ ] Task 8: src/processor.ts — orquestador + tests
- [ ] Task 9: src/webhook.ts + src/index.ts — Express + carousel buffer + tests
- [ ] Task 10: Dockerfile (con yt-dlp + ffmpeg) + deploy en Easypanel

### ⏳ Pendiente — Dashboard (Vercel)
- [ ] Task 11: Next.js scaffold + Supabase client + auth middleware + globals.css Fidely
- [ ] Task 12: InsightCard + InsightModal components
- [ ] Task 13: Filters component
- [ ] Task 14: app/page.tsx — feed principal
- [ ] Task 15: app/[id]/page.tsx — vista detalle
- [ ] Task 16: Deploy en Vercel

---

## Acción manual requerida ANTES de continuar

Aplica la migration en Supabase:
1. Supabase UI → SQL Editor
2. Pega el contenido de `supabase/migrations/001_content_insights.sql`
3. Run
4. Confirma que la tabla `content_insights` aparece en Table Editor

---

## Stack técnico

**Procesador:**
- Node.js/TypeScript ESM
- Express (webhook receiver)
- execa (shell para yt-dlp)
- groq-sdk (Whisper transcripción)
- @anthropic-ai/sdk (análisis + Vision)
- @supabase/supabase-js (service role)
- vitest (tests)
- Docker (deploy en Easypanel como el sales-orchestrator)

**Dashboard:**
- Next.js 15 App Router
- Google Fonts: Instrument Serif + Inter Tight (branding Fidely)
- Colores Fidely: fondo `#F8F6F1`, acento `#FF2D6F`, texto `#0A0A0A`
- @supabase/supabase-js (solo lectura)
- Auth: middleware Next.js con contraseña en env var

---

## Variables de entorno necesarias

### Procesador (.env)
```
GROQ_API_KEY=
ANTHROPIC_API_KEY=
EVOLUTION_API_URL=https://evolutionapi-evolution-api.hjbrvj.easypanel.host
EVOLUTION_API_KEY=
EVOLUTION_INSTANCE=          # nombre de la instancia WhatsApp Business
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=   # NUNCA en cliente ni en logs
WEBHOOK_SECRET=
DASHBOARD_URL=https://content-intel.vercel.app
PORT=3000
```

### Dashboard (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DASHBOARD_PASSWORD=
```

---

## Arquitectura del flujo

```
WhatsApp Business
  → Evolution API webhook (Easypanel, puerto 3000)
  → POST /webhook/whatsapp
  → Detecta tipo: URL de vídeo | imagen | carrusel (buffer 15s)
  → Si URL: yt-dlp → audio .mp3 → Groq Whisper → transcript
  → Si imagen: base64 directo
  → Claude analiza → { summary, strategies, content_type, tags, apply_to, skool_draft, social_draft }
  → Supabase INSERT content_insights
  → Evolution API: respuesta en WhatsApp con resumen
  → Dashboard Next.js lee de Supabase (read-only)
```

---

## Cómo retomar

En Claude Code, nueva sesión:
```
Continúa con Content Intel desde Task 2. 
El plan está en docs/superpowers/plans/2026-05-29-content-intel.md
El proyecto procesador está en Desktop/04-Proyectos/content-intel-processor/
```

O simplemente: **"continúa con Content Intel"** — hay memoria guardada.

---

## Infra existente relevante

- Evolution API: `evolutionapi-evolution-api.hjbrvj.easypanel.host` (ya instalado en Easypanel)
- n8n: `automatizaciones-n8n.hjbrvj.easypanel.host`
- Supabase proyecto fidelity: `vpoauhbflmexrnlahkgy`
- Sales-orchestrator en Easypanel (mismo patrón de deploy a seguir)
