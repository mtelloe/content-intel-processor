import { execa } from 'execa';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { unlink } from 'fs/promises';
export function detectPlatform(url) {
    if (/instagram\.com/.test(url))
        return 'instagram';
    if (/youtube\.com|youtu\.be/.test(url))
        return 'youtube';
    if (/tiktok\.com/.test(url))
        return 'tiktok';
    if (/twitter\.com|x\.com/.test(url))
        return 'twitter';
    return 'unknown';
}
export function buildYtdlpArgs(url, outputPath) {
    return [
        url,
        '-x',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '--no-playlist',
        '--max-filesize', '50m',
        '-o', outputPath,
    ];
}
export async function downloadAudio(url) {
    const platform = detectPlatform(url);
    const outputPath = join(tmpdir(), `${randomUUID()}.mp3`);
    try {
        await execa('yt-dlp', buildYtdlpArgs(url, outputPath), { timeout: 120_000 });
        return { path: outputPath, platform };
    }
    catch (err) {
        throw new Error(`yt-dlp failed for ${url}: ${err.message}`);
    }
}
export async function removeFile(path) {
    await unlink(path).catch(() => { });
}
