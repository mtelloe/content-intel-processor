import { describe, it, expect, vi } from 'vitest'
import type { AnalysisResult } from '../src/types.js'

const mockResult: AnalysisResult = {
  summary: 'Herramienta para generar anuncios con IA.',
  strategies: ['Usar batch de 10 variantes', 'Ángulo emocional variable'],
  content_type: 'herramienta',
  tags: ['ia', 'ads', 'creatividades'],
  apply_to: ['ads', 'skool'],
  skool_draft: 'Post para la comunidad...',
  social_draft: 'Caption para Instagram...',
}

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: JSON.stringify(mockResult) }]
        })
      }
    }))
  }
})

import { analyzeText, analyzeImages } from '../src/analyzer.js'

describe('analyzeText', () => {
  it('devuelve AnalysisResult parseado correctamente', async () => {
    const result = await analyzeText('Transcript de prueba')
    expect(result.summary).toBe('Herramienta para generar anuncios con IA.')
    expect(result.strategies).toHaveLength(2)
    expect(result.content_type).toBe('herramienta')
    expect(result.apply_to).toContain('ads')
  })

  it('strategies es siempre un array', async () => {
    const result = await analyzeText('Transcript de prueba')
    expect(Array.isArray(result.strategies)).toBe(true)
  })
})

describe('analyzeImages', () => {
  it('devuelve AnalysisResult para un array de imágenes base64', async () => {
    const result = await analyzeImages(['data:image/jpeg;base64,/9j/4AAQ...'])
    expect(result.summary).toBeDefined()
    expect(result.skool_draft).toBeDefined()
  })
})
