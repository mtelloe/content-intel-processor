import { describe, it, expect, vi } from 'vitest'

vi.mock('fs', () => ({
  createReadStream: vi.fn().mockReturnValue('mock-stream'),
}))

vi.mock('groq-sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      audio: {
        transcriptions: {
          create: vi.fn().mockResolvedValue('Hola, esto es una prueba de transcripción.')
        }
      }
    }))
  }
})

import { transcribeAudio } from '../src/transcriber.js'

describe('transcribeAudio', () => {
  it('devuelve el texto transcrito', async () => {
    const result = await transcribeAudio('/tmp/fake-audio.mp3')
    expect(result).toBe('Hola, esto es una prueba de transcripción.')
  })

  it('devuelve string no vacío', async () => {
    const result = await transcribeAudio('/tmp/fake-audio.mp3')
    expect(result.length).toBeGreaterThan(0)
  })
})
