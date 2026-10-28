import type { ReaderArticle } from './reader-data'

const CHARACTERS_PER_MINUTE = 500

export function estimateReadingMinutes(body: ReaderArticle['body']): number {
  const text = body.flatMap(section => [section.heading ?? '', ...section.paragraphs, section.quote?.text ?? '']).join('')
  const characterCount = text.replace(/\s/g, '').length
  return Math.max(1, Math.ceil(characterCount / CHARACTERS_PER_MINUTE))
}
