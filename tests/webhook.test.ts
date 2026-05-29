import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../src/processor.js', () => ({
  processRequest: vi.fn().mockResolvedValue(undefined),
}))

import express from 'express'
import request from 'supertest'
import { createWebhookRouter } from '../src/webhook.js'
import { processRequest } from '../src/processor.js'

const app = express()
app.use(express.json())
app.use('/webhook', createWebhookRouter())

describe('POST /webhook/whatsapp', () => {
  beforeEach(() => vi.mocked(processRequest).mockClear())

  it('procesa mensaje que es solo URL de vídeo', async () => {
    const payload = {
      event: 'messages.upsert',
      data: {
        key: { remoteJid: '34612345678@s.whatsapp.net', fromMe: false, id: 'MSG001' },
        messageType: 'conversation',
        message: { conversation: 'https://www.instagram.com/reel/ABC/' },
      }
    }
    const res = await request(app).post('/webhook/whatsapp').send(payload)
    expect(res.status).toBe(200)
    expect(processRequest).toHaveBeenCalledWith(expect.objectContaining({
      messageId: 'MSG001',
      inputType: 'video_url',
      sourceUrl: 'https://www.instagram.com/reel/ABC/',
    }))
  })

  it('extrae URL de vídeo de mensaje con texto adicional', async () => {
    const payload = {
      event: 'messages.upsert',
      data: {
        key: { remoteJid: '34612345678@s.whatsapp.net', fromMe: false, id: 'MSG003' },
        messageType: 'conversation',
        message: { conversation: 'analiza este reel https://www.instagram.com/reel/XYZ/ porfa' },
      }
    }
    const res = await request(app).post('/webhook/whatsapp').send(payload)
    expect(res.status).toBe(200)
    expect(processRequest).toHaveBeenCalledWith(expect.objectContaining({
      messageId: 'MSG003',
      inputType: 'video_url',
      sourceUrl: 'https://www.instagram.com/reel/XYZ/',
    }))
  })

  it('ignora mensajes enviados por el propio bot (fromMe: true)', async () => {
    const payload = {
      event: 'messages.upsert',
      data: {
        key: { remoteJid: '34612345678@s.whatsapp.net', fromMe: true, id: 'MSG002' },
        messageType: 'conversation',
        message: { conversation: 'https://www.instagram.com/reel/XYZ/' },
      }
    }
    const res = await request(app).post('/webhook/whatsapp').send(payload)
    expect(res.status).toBe(200)
    expect(processRequest).not.toHaveBeenCalled()
  })

  it('ignora eventos que no son messages.upsert', async () => {
    const res = await request(app).post('/webhook/whatsapp').send({ event: 'connection.update' })
    expect(res.status).toBe(200)
    expect(processRequest).not.toHaveBeenCalled()
  })
})
