import { createClient } from '@supabase/supabase-js'
import type { AnalysisResult, InputType } from './types.js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function saveInsight(params: {
  messageId: string
  inputType: InputType
  sourceUrl?: string
  sourcePlatform?: string
  transcript?: string
  analysis: AnalysisResult
}): Promise<string> {
  const { data, error } = await supabase
    .from('content_insights')
    .insert({
      whatsapp_message_id: params.messageId,
      input_type: params.inputType,
      source_url: params.sourceUrl,
      source_platform: params.sourcePlatform,
      transcript: params.transcript,
      summary: params.analysis.summary,
      strategies: params.analysis.strategies,
      content_type: params.analysis.content_type,
      tags: params.analysis.tags,
      apply_to: params.analysis.apply_to,
      skool_draft: params.analysis.skool_draft,
      social_draft: params.analysis.social_draft,
      status: 'processed',
    })
    .select('id')
    .single()

  if (error) throw new Error(`Supabase insert failed: ${error.message}`)
  return data.id
}

export async function saveError(messageId: string, errorMessage: string): Promise<void> {
  await supabase
    .from('content_insights')
    .upsert({
      whatsapp_message_id: messageId,
      input_type: 'video_url',
      summary: '',
      status: 'error',
      error_message: errorMessage,
    })
}

export async function isDuplicate(messageId: string): Promise<boolean> {
  const { data } = await supabase
    .from('content_insights')
    .select('id')
    .eq('whatsapp_message_id', messageId)
    .maybeSingle()
  return data !== null
}
