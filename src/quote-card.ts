const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' })
export const quoteLength = (text: string) => [...segmenter.segment(text)].length

export function prepareQuote(text: string): string | null {
  const normalized = text.replace(/\s+/g, ' ').trim()
  return normalized && quoteLength(normalized) <= 240 ? normalized : null
}

export function wrapCardText(text: string, measure: (text: string) => number, maxWidth: number): string[] {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    let line = ''
    for (const { segment } of segmenter.segment(paragraph)) {
      if (line && measure(line + segment) > maxWidth) {
        lines.push(line.trimEnd())
        line = segment.trimStart()
      } else line += segment
    }
    if (line) lines.push(line.trimEnd())
  }
  return lines
}

export function fitCardQuote(text: string, measure: (text: string, size: number) => number, large: boolean): { size: number; lines: string[] } | null {
  for (let size = 76; size >= 32; size -= 2) {
    const lines = wrapCardText(text, value => measure(value, size), 828)
    if (lines.length * size * 1.5 <= 610 && lines.every(line => measure(line, size) <= 828)) {
      const displaySize = large ? size : Math.floor(size * 0.82 / 2) * 2
      return { size: displaySize, lines: large ? lines : wrapCardText(text, value => measure(value, displaySize), 828) }
    }
  }
  return null
}

export const cardPalettes = [
  { id: 'burgundy', name: '버건디', background: '#49242d', panel: '#713e48', ink: '#fff6e9', muted: '#ead7cf' },
  { id: 'cream', name: '크림', background: '#e9e4d8', panel: '#f7f3e9', ink: '#302e29', muted: '#625c50' },
  { id: 'charcoal', name: '차콜', background: '#222521', panel: '#373c35', ink: '#f4f0e4', muted: '#d0d1c5' },
] as const

export type QuoteSource = { title: string; author: string; date: string; quote: string }

export async function createQuoteCard(source: QuoteSource, text: string, paletteIndex: number, large: boolean): Promise<Blob> {
  await document.fonts.load('600 48px Pretendard')
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('이미지를 만들 수 없습니다.')
  const palette = cardPalettes[paletteIndex]
  ctx.fillStyle = palette.background
  ctx.fillRect(0, 0, 1080, 1920)
  ctx.fillStyle = palette.muted
  ctx.font = '500 27px Pretendard, sans-serif'
  ctx.fillText('나의 축구, 한 문장', 88, 230)
  ctx.fillStyle = palette.panel
  ctx.beginPath()
  ctx.roundRect(64, 332, 952, 1160, 32)
  ctx.fill()
  ctx.fillStyle = palette.muted
  ctx.font = '500 29px Pretendard, sans-serif'
  ctx.fillText('PITCHSIDE · ' + source.date.replaceAll('-', '.'), 120, 415)
  ctx.fillStyle = palette.ink
  ctx.font = '600 34px Pretendard, sans-serif'
  const title = wrapCardText(source.title, value => ctx.measureText(value).width, 832)
  title.forEach((line, i) => ctx.fillText(line, 120, 487 + i * 49))
  ctx.font = '110px Georgia, serif'
  ctx.fillText('“', 112, 675)
  ctx.textAlign = 'right'
  ctx.fillText('”', 960, 675)
  ctx.textAlign = 'left'
  const layout = fitCardQuote(text, (value, size) => {
    ctx.font = `700 ${size}px Pretendard, sans-serif`
    return ctx.measureText(value).width
  }, large)
  if (!layout) throw new RangeError('문장을 카드에 담기 어렵습니다. 문장을 짧게 바꿔주세요.')
  const { size, lines } = layout
  ctx.font = `700 ${size}px Pretendard, sans-serif`
  const startY = 740 + (610 - lines.length * size * 1.5) / 2
  lines.forEach((line, i) => ctx.fillText(line, 120, startY + i * size * 1.5))
  ctx.fillStyle = palette.muted
  ctx.font = '400 28px Pretendard, sans-serif'
  ctx.fillText(source.author + ' 기자', 120, 1415)
  ctx.fillStyle = palette.ink
  ctx.font = 'italic 900 65px Arial, sans-serif'
  ctx.fillText('pitchside.', 88, 1640)
  ctx.fillStyle = palette.muted
  ctx.font = '400 25px Pretendard, sans-serif'
  ctx.fillText('경기장 곁의 이야기를 나눕니다.', 88, 1695)
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('이미지 저장에 실패했습니다.')), 'image/png'))
}
