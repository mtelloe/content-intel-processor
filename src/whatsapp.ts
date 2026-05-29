export function formatSuccessMessage(
  summary: string,
  strategies: string[],
  contentType: string,
  insightId: string,
): string {
  const strategiesList = strategies.map(s => `• ${s}`).join('\n')
  const dashboardUrl = process.env.DASHBOARD_URL ?? 'https://content-intel.vercel.app'
  return [
    `✅ *Analizado*`,
    ``,
    `📝 *Resumen:* ${summary}`,
    ``,
    `🎯 *Estrategias:*`,
    strategiesList,
    ``,
    `🏷️ ${contentType}`,
    ``,
    `Ver en dashboard → ${dashboardUrl}/${insightId}`,
  ].join('\n')
}

export function formatErrorMessage(reason: string): string {
  return `❌ No pude procesar este contenido.\n\nMotivo: ${reason}`
}

export async function sendReply(remoteJid: string, text: string): Promise<void> {
  const url = `${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: process.env.EVOLUTION_API_KEY!,
    },
    body: JSON.stringify({ number: remoteJid, text }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Evolution API error ${res.status}: ${body}`)
  }
}
