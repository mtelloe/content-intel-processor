import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn().mockResolvedValue({ ok: true })
vi.stubGlobal('fetch', mockFetch)

import { sendReply, formatSuccessMessage, formatErrorMessage } from '../src/whatsapp.js'

beforeEach(() => {
  process.env.EVOLUTION_API_URL = 'https://evolution.example.com'
  process.env.EVOLUTION_API_KEY = 'test-key'
  process.env.EVOLUTION_INSTANCE = 'test-instance'
  mockFetch.mockClear()
})

describe('formatSuccessMessage', () => {
  it('incluye el resumen en el mensaje', () => {
    const msg = formatSuccessMessage('Resumen de prueba', ['Táctica 1', 'Táctica 2'], 'herramienta', 'abc123')
    expect(msg).toContain('Resumen de prueba')
    expect(msg).toContain('Táctica 1')
    expect(msg).toContain('herramienta')
  })
})

describe('formatErrorMessage', () => {
  it('incluye el motivo del error', () => {
    const msg = formatErrorMessage('URL no soportada')
    expect(msg).toContain('URL no soportada')
  })
})

describe('sendReply', () => {
  it('llama a Evolution API con los datos correctos', async () => {
    await sendReply('34612345678@s.whatsapp.net', 'Hola!')
    expect(mockFetch).toHaveBeenCalledWith(
      'https://evolution.example.com/message/sendText/test-instance',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ apikey: 'test-key' }),
      })
    )
  })
})
