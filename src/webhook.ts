import { Router } from 'express'
import { processRequest } from './processor.js'

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL ?? ''
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY ?? ''
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE ?? ''
const PERSONAL_AGENT_URL = process.env.PERSONAL_AGENT_URL ?? 'https://personal-agent-backend.hjbrvj.easypanel.host/webhook'

const carouselBuffer = new Map<string, {
  images: string[]
  messageId: string
  timeout: ReturnType<typeof setTimeout>
}>()

const VIDEO_URL_RE = /https?:\/\/[^\s]*(instagram\.com|youtube\.com|youtu\.be|tiktok\.com|twitter\.com|x\.com)[^\s]*/i

function extractVideoUrl(text: string): string | null {
  const match = text.match(VIDEO_URL_RE)
  return match ? match[0] : null
}

async function fetchBase64FromEvolution(message: unknown): Promise<string | undefined> {
  try {
    const res = await fetch(
      `${EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${EVOLUTION_INSTANCE}`,
      {
        method: 'POST',
        headers: { 'apikey': EVOLUTION_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      }
    )
    if (!res.ok) return undefined
    const json = await res.json() as { base64?: string }
    return json.base64
  } catch {
    return undefined
  }
}

function scheduleCarousel(remoteJid: string, base64: string, messageId: string) {
  const existing = carouselBuffer.get(remoteJid)
  if (existing) {
    clearTimeout(existing.timeout)
    existing.images.push(base64)
    existing.timeout = setTimeout(() => {
      carouselBuffer.delete(remoteJid)
      const inputType = existing.images.length > 1 ? 'carousel' : 'image'
      processRequest({ messageId: existing.messageId, remoteJid, inputType, base64Images: existing.images })
    }, 15_000)
  } else {
    const timeout = setTimeout(() => {
      const entry = carouselBuffer.get(remoteJid)
      if (!entry) return
      carouselBuffer.delete(remoteJid)
      const inputType = entry.images.length > 1 ? 'carousel' : 'image'
      processRequest({ messageId: entry.messageId, remoteJid, inputType, base64Images: entry.images })
    }, 15_000)
    carouselBuffer.set(remoteJid, { images: [base64], messageId, timeout })
  }
}

export function createWebhookRouter(): Router {
  const router = Router()

  router.post('/whatsapp', (req, res) => {
    res.sendStatus(200)

    const body = req.body
    if (body?.event !== 'messages.upsert') return

    const data = body?.data
    const key = data?.key
    if (!key || key.fromMe) return

    const remoteJid: string = key.remoteJid
    const messageId: string = key.id
    const messageType: string = data?.messageType

    if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
      const text: string = data?.message?.conversation ?? data?.message?.extendedTextMessage?.text ?? ''
      const videoUrl = extractVideoUrl(text)
      if (!videoUrl) {
        console.log('[proxy] text msg, forwarding to personal agent:', text.slice(0, 60))
        fetch(PERSONAL_AGENT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }).then(r => console.log('[proxy] personal agent responded:', r.status))
          .catch(e => console.error('[proxy] error:', e.message))
        return
      }
      console.log('[proxy] video URL detected:', videoUrl.slice(0, 80))
      processRequest({ messageId, remoteJid, inputType: 'video_url', sourceUrl: videoUrl })

    } else if (messageType === 'imageMessage') {
      const inlineBase64: string | undefined = data?.base64 ?? data?.message?.imageMessage?.base64

      if (inlineBase64) {
        scheduleCarousel(remoteJid, inlineBase64, messageId)
      } else {
        // webhookBase64 not enabled — download from Evolution API
        fetchBase64FromEvolution(data?.message).then(base64 => {
          if (!base64) return
          scheduleCarousel(remoteJid, base64, messageId)
        })
      }
    }
  })

  return router
}
