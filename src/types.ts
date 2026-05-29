export type InputType = 'video_url' | 'image' | 'carousel'
export type ContentType = 'herramienta' | 'estrategia' | 'tutorial' | 'inspiración'
export type ApplyTo = 'skool' | 'social' | 'ads'

export interface AnalysisResult {
  summary: string
  strategies: string[]
  content_type: ContentType
  tags: string[]
  apply_to: ApplyTo[]
  skool_draft: string
  social_draft: string
}

export interface ContentInsight extends AnalysisResult {
  id: string
  created_at: string
  whatsapp_message_id: string
  input_type: InputType
  source_url?: string
  source_platform?: string
  transcript?: string
  status: 'processed' | 'error'
  error_message?: string
}

export interface ProcessRequest {
  messageId: string
  remoteJid: string
  inputType: InputType
  sourceUrl?: string
  base64Images?: string[]
}
