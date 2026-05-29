import Anthropic from '@anthropic-ai/sdk'
import type { AnalysisResult } from './types.js'

let anthropicClient: Anthropic | null = null

function getClient(): Anthropic {
  if (!anthropicClient) anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return anthropicClient
}

const SYSTEM_PROMPT = `Eres un asistente de análisis de contenido para María, creadora de contenido y gestora de una comunidad Skool sobre marketing digital y negocios.

María guarda contenido de Instagram, YouTube y TikTok para aprender estrategias que luego aplica en sus redes sociales y sus clases de Skool.

Tu tarea: analizar el contenido proporcionado y extraer lo más útil.

IMPORTANTE: Responde SOLO con JSON válido, sin texto adicional, siguiendo exactamente esta estructura:
{
  "summary": "2-3 frases con la idea principal del contenido",
  "strategies": ["táctica accionable 1", "táctica accionable 2"],
  "content_type": "herramienta|estrategia|tutorial|inspiración",
  "tags": ["tag1", "tag2", "tag3"],
  "apply_to": ["skool", "social", "ads"],
  "skool_draft": "Post completo listo para pegar en la comunidad Skool, tono educativo y cercano, en español",
  "social_draft": "Caption para Instagram o LinkedIn con gancho inicial y CTA, en español"
}`

function parseAnalysis(rawText: string): AnalysisResult {
  const jsonMatch = rawText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in Claude response')
  const parsed = JSON.parse(jsonMatch[0])

  return {
    summary: parsed.summary ?? '',
    strategies: Array.isArray(parsed.strategies) ? parsed.strategies : [],
    content_type: parsed.content_type ?? 'inspiración',
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    apply_to: Array.isArray(parsed.apply_to) ? parsed.apply_to : [],
    skool_draft: parsed.skool_draft ?? '',
    social_draft: parsed.social_draft ?? '',
  }
}

export async function analyzeText(transcript: string): Promise<AnalysisResult> {
  const client = getClient()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Analiza esta transcripción de vídeo:\n\n${transcript}` }],
  })

  const text = message.content.find(b => b.type === 'text')?.text ?? ''
  return parseAnalysis(text)
}

export async function analyzeImages(base64Images: string[]): Promise<AnalysisResult> {
  const client = getClient()

  const imageContent = base64Images.map(b64 => {
    const match = b64.match(/^data:(image\/\w+);base64,(.+)$/)
    const mediaType = (match?.[1] ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
    const data = match?.[2] ?? b64
    return {
      type: 'image' as const,
      source: { type: 'base64' as const, media_type: mediaType, data },
    }
  })

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: [
        ...imageContent,
        { type: 'text', text: 'Analiza este post/carrusel de Instagram y extrae los insights.' },
      ],
    }],
  })

  const text = message.content.find(b => b.type === 'text')?.text ?? ''
  return parseAnalysis(text)
}
