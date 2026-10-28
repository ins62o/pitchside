import { articles } from './articles'
import type { Article } from './articles'

// shortcut: this CMS persists in one browser; replace this adapter with an authenticated API for team use.
let database: Promise<IDBDatabase> | undefined

function openDatabase(): Promise<IDBDatabase> {
  if (!database) {
    database = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('pitchside-cms', 1)
      request.onupgradeneeded = () => {
        const store = request.result.createObjectStore('articles', { keyPath: 'id' })
        articles.forEach((article, index) => {
          const publishedAt = `${article.date.replaceAll('.', '-')}T03:00:${String(59 - index).padStart(2, '0')}.000Z`
          store.add({ ...article, status: 'published', author: 'Pitchside 편집팀', publishedAt, updatedAt: publishedAt, isSample: true, imageAlt: article.image === 'stadium' ? '조명 아래 펼쳐진 축구장과 터치라인, AI 생성 샘플' : '경기장에서 응원하는 팬들의 뒷모습, AI 생성 샘플', imageCredit: 'AI 생성 샘플 이미지' })
        })
      }
      request.onsuccess = () => {
        request.result.onversionchange = () => { request.result.close(); database = undefined }
        resolve(request.result)
      }
      request.onerror = () => reject(new Error('이 브라우저에서 콘텐츠 저장소를 열 수 없습니다. 일반 브라우저 창에서 다시 시도해주세요.'))
      request.onblocked = () => reject(new Error('다른 Pitchside 탭을 닫고 새로고침해주세요.'))
    }).catch(error => { database = undefined; throw error })
  }
  return database
}

export async function loadArticles(): Promise<Article[]> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('articles', 'readonly')
    const request = transaction.objectStore('articles').getAll()
    transaction.oncomplete = () => resolve(request.result as Article[])
    transaction.onabort = () => reject(new Error('저장된 콘텐츠를 읽지 못했습니다. 새로고침 후 다시 시도해주세요.'))
    transaction.onerror = () => reject(new Error('콘텐츠를 읽는 중 오류가 발생했습니다.'))
  })
}

export async function storeArticle(article: Article, expectedVersion?: string): Promise<void> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('articles', 'readwrite')
    const store = transaction.objectStore('articles')
    let conflict = false
    const request = store.get(article.id)
    request.onsuccess = () => {
      const current = request.result as Article | undefined
      if (current && current.updatedAt !== expectedVersion) { conflict = true; transaction.abort(); return }
      store.put(article)
    }
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(new Error('저장 공간이 부족하거나 저장할 수 없습니다. 기존 콘텐츠는 유지됩니다.'))
    transaction.onabort = () => reject(new Error(conflict ? '다른 탭에서 이 글이 변경되었습니다. 작성 내용을 복사한 뒤 목록에서 다시 열어주세요.' : '저장하지 못했습니다. 기존 콘텐츠는 유지됩니다. 다시 시도해주세요.'))
  })
}
