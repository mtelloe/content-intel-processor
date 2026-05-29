import { Router } from 'express'
import { processRequest } from './processor.js'

const carouselBuffer = new Map<string, {
  images: string[]
  messageId: string
  timeout: ReturnType<typeof setTimeout>
}>()

function isUrl(text: string): boolean {
  return /^https?:\/\//i.test(text.trim())
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
      if (!isUrl(text)) return
      processRequest({ messageId, remoteJid, inputType: 'video_url', sourceUrl: text.trim() })

    } else if (messageType === 'imageMessage') {
      const base64: string | undefined = data?.base64 ?? data?.message?.imageMessage?.base64
      if (!base64) return

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
  })

  return router
}
