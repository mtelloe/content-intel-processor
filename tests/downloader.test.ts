import { describe, it, expect } from 'vitest'
import { detectPlatform, buildYtdlpArgs } from '../src/downloader.js'

describe('detectPlatform', () => {
  it('detecta instagram', () => {
    expect(detectPlatform('https://www.instagram.com/reel/ABC123/')).toBe('instagram')
  })
  it('detecta youtube', () => {
    expect(detectPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube')
  })
  it('detecta youtu.be', () => {
    expect(detectPlatform('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube')
  })
  it('detecta tiktok', () => {
    expect(detectPlatform('https://www.tiktok.com/@user/video/123')).toBe('tiktok')
  })
  it('devuelve unknown para URL desconocida', () => {
    expect(detectPlatform('https://example.com/video')).toBe('unknown')
  })
})

describe('buildYtdlpArgs', () => {
  it('incluye formato de solo audio', () => {
    const args = buildYtdlpArgs('https://example.com', '/tmp/out.mp3', 'unknown')
    expect(args).toContain('-x')
    expect(args).toContain('--audio-format')
    expect(args).toContain('mp3')
  })
  it('añade --cookies para instagram', () => {
    const args = buildYtdlpArgs('https://www.instagram.com/reel/ABC/', '/tmp/out.mp3', 'instagram')
    expect(args).toContain('--cookies')
  })
  it('no añade --cookies para youtube', () => {
    const args = buildYtdlpArgs('https://youtube.com/watch?v=x', '/tmp/out.mp3', 'youtube')
    expect(args).not.toContain('--cookies')
  })
})
