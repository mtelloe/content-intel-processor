import { downloadAudio, removeFile } from './downloader.js';
import { transcribeAudio } from './transcriber.js';
import { analyzeText, analyzeImages } from './analyzer.js';
import { saveInsight, saveError, isDuplicate } from './supabase.js';
import { sendReply, formatSuccessMessage, formatErrorMessage } from './whatsapp.js';
export async function processRequest(req) {
    const { messageId, remoteJid, inputType, sourceUrl, base64Images } = req;
    if (await isDuplicate(messageId))
        return;
    try {
        if (inputType === 'video_url' && sourceUrl) {
            const { path, platform } = await downloadAudio(sourceUrl);
            try {
                const transcript = await transcribeAudio(path);
                const analysis = await analyzeText(transcript);
                const id = await saveInsight({
                    messageId,
                    inputType,
                    sourceUrl,
                    sourcePlatform: platform,
                    transcript,
                    analysis,
                });
                await sendReply(remoteJid, formatSuccessMessage(analysis.summary, analysis.strategies, analysis.content_type, id));
            }
            finally {
                await removeFile(path);
            }
        }
        else if ((inputType === 'image' || inputType === 'carousel') && base64Images?.length) {
            const analysis = await analyzeImages(base64Images);
            const id = await saveInsight({ messageId, inputType, analysis });
            await sendReply(remoteJid, formatSuccessMessage(analysis.summary, analysis.strategies, analysis.content_type, id));
        }
    }
    catch (err) {
        const message = err.message;
        await saveError(messageId, message);
        await sendReply(remoteJid, formatErrorMessage(message));
    }
}
