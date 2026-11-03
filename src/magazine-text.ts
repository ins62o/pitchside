export type MagazineTextPart = { text: string; style: 'plain' | 'bold' | 'underline' }

export function parseMagazineText(text: string): MagazineTextPart[] {
  const parts: MagazineTextPart[] = []
  const pattern = /\*\*(.+?)\*\*|__(.+?)__/g
  let end = 0
  for (const match of text.matchAll(pattern)) {
    if (match.index > end) parts.push({ text: text.slice(end, match.index), style: 'plain' })
    parts.push({ text: match[1] ?? match[2], style: match[1] ? 'bold' : 'underline' })
    end = match.index + match[0].length
  }
  if (end < text.length) parts.push({ text: text.slice(end), style: 'plain' })
  return parts
}
