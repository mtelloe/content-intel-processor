import Groq from 'groq-sdk'
import { createReadStream } from 'fs'

let groqClient: Groq | null = null

function getClient(): Groq {
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return groqClient
}

export async function transcribeAudio(audioPath: string): Promise<string> {
  const client = getClient()

  const transcription = await client.audio.transcriptions.create({
    file: createReadStream(audioPath) as unknown as File,
    model: 'whisper-large-v3-turbo',
    language: 'es',
    response_format: 'text',
  })

  return (transcription as unknown as string).trim()
}
