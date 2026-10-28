import type { Article } from './articles.ts'

export type ArticleStatus = 'draft' | 'published' | 'archived'
export function publicArticles(documents: Article[]): Article[] {
  return documents.filter(x => x.status === 'published').sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
}

export function imageSource(value: string): string {
  return value === 'stadium' || value === 'fans' ? `/images/${value}.png` : value
}

function safeImage(value: string): boolean {
  return !value || ['stadium', 'fans', '/images/stadium.png', '/images/fans.png'].includes(value) || /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)
}

export function validateArticle(article: Article, status: ArticleStatus): string[] {
  const errors: string[] = []
  if (!article.id || !['news', 'magazine'].includes(article.section)) errors.push('콘텐츠 정보를 확인해주세요.')
  if (!['draft', 'published', 'archived'].includes(status)) errors.push('저장 상태를 확인해주세요.')
  if (article.title.length > 180 || article.summary.length > 600 || (article.author || '').length > 80) errors.push('제목은 180자, 요약은 600자, 작성자는 80자 이내로 입력해주세요.')
  if (!safeImage(article.image) || article.image.length > 8_000_000) errors.push('대표사진을 다시 선택해주세요.')
  if (article.body.length > 50) errors.push('본문은 최대 50개 블록으로 구성할 수 있습니다.')
  if (article.body.some(block => (block.image && (!safeImage(block.image) || block.image.length > 8_000_000)) || (block.youtubeUrl && !youtubeEmbed(block.youtubeUrl)))) errors.push('본문 사진이나 유튜브 링크를 확인해주세요.')
  if (article.body.reduce((sum, block) => sum + block.paragraphs.join('').length, 0) > 100_000) errors.push('본문은 10만 자 이내로 입력해주세요.')
  if (status === 'published') {
    if (!article.title.trim()) errors.push('제목을 입력해주세요.')
    if (!article.summary.trim()) errors.push('기사 요약을 입력해주세요.')
    if (!article.author?.trim()) errors.push('작성자를 입력해주세요.')
    if (!article.category.trim()) errors.push('분류를 입력해주세요.')
    if (!article.image) errors.push('대표사진을 추가해주세요.')
    if (article.image && !article.imageAlt?.trim()) errors.push('대표사진 설명을 입력해주세요.')
    if (!article.body.some(block => block.paragraphs.some(p => p.trim()) || block.image || block.youtubeUrl)) errors.push('본문을 작성해주세요.')
    if (article.body.some(block => block.image && !block.imageAlt?.trim())) errors.push('본문 사진 설명을 입력해주세요.')
  }
  return errors
}

export function prepareArticle(article: Article, status: ArticleStatus, now: string): Article {
  const errors = validateArticle(article, status)
  if (errors.length) throw new Error(errors.join('\n'))
  const publishedAt = article.publishedAt || (status === 'published' ? now : undefined)
  const date = publishedAt ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date(publishedAt)).replaceAll('-', '.') : article.date
  const length = article.body.reduce((sum, block) => sum + (block.heading || '').length + block.paragraphs.join('').length, 0)
  return { ...article, title: article.title.trim(), summary: article.summary.trim(), author: article.author?.trim(), category: article.category.trim(), status, publishedAt, updatedAt: now, date, readMinutes: Math.max(1, Math.ceil(length / 450)) }
}

export function youtubeEmbed(value: string): string | null {
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:') return null
    const parts = url.pathname.split('/').filter(Boolean)
    const id = ['youtu.be', 'www.youtu.be'].includes(url.hostname) ? parts[0] : ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname) ? (url.searchParams.get('v') || (['embed', 'shorts'].includes(parts[0]) ? parts[1] : '')) : ''
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null
  } catch { return null }
}
