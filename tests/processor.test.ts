import { describe, it, expect, vi } from 'vitest'

vi.mock('../src/downloader.js', () => ({
  downloadAudio: vi.fn().mockResolvedValue({ path: '/tmp/test.mp3', platform: 'instagram' }),
  removeFile: vi.fn().mockResolvedValue(undefined),
  detectPlatform: vi.fn().mockReturnValue('instagram'),
}))
vi.mock('../src/transcriber.js', () => ({
  transcribeAudio: vi.fn().mockResolvedValue('Este vídeo explica cómo usar IA para crear anuncios.'),
}))
vi.mock('../src/analyzer.js', () => ({
  analyzeText: vi.fn().mockResolvedValue({
    summary: 'Herramienta IA para anuncios.',
    strategies: ['Táctica 1'],
    content_type: 'herramienta',
    tags: ['ia', 'ads'],
    apply_to: ['ads'],
    skool_draft: 'Post Skool...',
    social_draft: 'Caption IG...',
  }),
  analyzeImages: vi.fn().mockResolvedValue({
    summary: 'Post sobre estrategia.',
    strategies: ['Táctica imagen'],
    content_type: 'estrategia',
    tags: ['estrategia'],
    apply_to: ['social'],
    skool_draft: 'Post Skool...',
    social_draft: 'Caption IG...',
  }),
}))
vi.mock('../src/supabase.js', () => ({
  saveInsight: vi.fn().mockResolvedValue('uuid-1234'),
  saveError: vi.fn().mockResolvedValue(undefined),
  isDuplicate: vi.fn().mockResolvedValue(false),
}))
vi.mock('../src/whatsapp.js', () => ({
  sendReply: vi.fn().mockResolvedValue(undefined),
  formatSuccessMessage: vi.fn().mockReturnValue('✅ Analizado'),
  formatErrorMessage: vi.fn().mockReturnValue('❌ Error'),
}))

import { processRequest } from '../src/processor.js'
import { isDuplicate, saveInsight } from '../src/supabase.js'
import { sendReply } from '../src/whatsapp.js'

describe('processRequest — video_url', () => {
  it('descarga, transcribe, analiza y guarda en Supabase', async () => {
    await processRequest({
      messageId: 'msg-001',
      remoteJid: '34612345678@s.whatsapp.net',
      inputType: 'video_url',
      sourceUrl: 'https://www.instagram.com/reel/ABC/',
    })
    expect(saveInsight).toHaveBeenCalled()
    expect(sendReply).toHaveBeenCalled()
  })

  it('omite si el mensaje ya fue procesado (duplicado)', async () => {
    vi.mocked(isDuplicate).mockResolvedValueOnce(true)
    await processRequest({
      messageId: 'msg-duplicate',
      remoteJid: '34612345678@s.whatsapp.net',
      inputType: 'video_url',
      sourceUrl: 'https://www.instagram.com/reel/ABC/',
    })
    expect(saveInsight).not.toHaveBeenCalledWith(expect.objectContaining({ messageId: 'msg-duplicate' }))
  })
})

describe('processRequest — image', () => {
  it('analiza imágenes con Vision y guarda en Supabase', async () => {
    await processRequest({
      messageId: 'msg-img-001',
      remoteJid: '34612345678@s.whatsapp.net',
      inputType: 'image',
      base64Images: ['data:image/jpeg;base64,/9j/4AAQ'],
    })
    expect(saveInsight).toHaveBeenCalled()
  })
})
