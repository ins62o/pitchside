import { Badge, Icon } from '@seed-design/react'
import type { ReaderArticle } from './reader-data'
import { estimateReadingMinutes } from './reading-time'

export function ArticleCategory({ article }: { article: ReaderArticle }) {
  return <div className="article-category"><Badge.Root className="league-badge" variant="weak" tone="brand"><Badge.Label>{article.league}</Badge.Label></Badge.Root><span>{article.kind}</span></div>
}
export function ArticleByline({ article, readingTime = false }: { article: ReaderArticle; readingTime?: boolean }) {
  return <div className="byline"><span>{article.author} 기자</span><time dateTime={article.date}>{article.date.replaceAll('-', '.')}</time>{readingTime && <span className="reading-time"><Icon aria-hidden="true" svg={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>} /><span className="sr-only">예상 읽기 시간 </span>{estimateReadingMinutes(article.body)}분</span>}</div>
}

