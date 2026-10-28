import { createContext, useContext } from 'react'
import type { Article } from './articles'
import type { ArticleStatus } from './cms-model'

export type CmsContextValue = {
  documents: Article[]
  published: Article[]
  loading: boolean
  error: string
  saveArticle: (article: Article, status: ArticleStatus) => Promise<Article>
}
export const CmsContext = createContext<CmsContextValue | null>(null)
export function useCms(): CmsContextValue {
  const context = useContext(CmsContext)
  if (!context) throw new Error('CMS가 연결되지 않았습니다.')
  return context
}
