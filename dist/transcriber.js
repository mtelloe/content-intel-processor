import Groq from 'groq-sdk';
import { createReadStream } from 'fs';
let groqClient = null;
function getClient() {
    if (!groqClient)
        groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    return groqClient;
}
export async function transcribeAudio(audioPath) {
    const client = getClient();
    const transcription = await client.audio.transcriptions.create({
        file: createReadStream(audioPath),
        model: 'whisper-large-v3-turbo',
        language: 'es',
        response_format: 'text',
    });
    return transcription.trim();
}
