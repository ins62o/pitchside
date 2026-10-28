import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Article } from './articles'
import { CmsContext } from './cms-context'
import { prepareArticle, publicArticles } from './cms-model'
import type { ArticleStatus } from './cms-model'
import { loadArticles, storeArticle } from './cms-store'

export function CmsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const channel = useRef<BroadcastChannel | null>(null)
  useEffect(() => {
    let active = true
    async function refresh() {
      try { const data = await loadArticles(); if (active) { setDocuments(data); setError('') } }
      catch (err) { if (active) setError(err instanceof Error ? err.message : '콘텐츠를 불러오지 못했습니다.') }
      finally { if (active) setLoading(false) }
    }
    void refresh()
    const messages = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('pitchside-cms-updates') : null
    channel.current = messages
    if (messages) messages.onmessage = () => { void refresh() }
    window.addEventListener('focus', refresh)
    return () => { active = false; window.removeEventListener('focus', refresh); messages?.close(); channel.current = null }
  }, [])
  const saveArticle = useCallback(async (input: Article, status: ArticleStatus) => {
    const article = prepareArticle(input, status, new Date().toISOString())
    await storeArticle(article, input.updatedAt)
    setDocuments(current => [...current.filter(item => item.id !== article.id), article])
    channel.current?.postMessage('updated')
    return article
  }, [])
  return <CmsContext.Provider value={{ documents, published: publicArticles(documents), loading, error, saveArticle }}>{children}</CmsContext.Provider>
}
