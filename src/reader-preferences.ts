export type ReaderTheme = 'light' | 'dark'
export type ArticleView = 'list' | 'gallery'
export type ReaderPreferences = { theme: ReaderTheme; view: ArticleView }

const storageKey = 'pitchside:reader-preferences:v1'

export function readReaderPreferences(storage?: Pick<Storage, 'getItem'>): ReaderPreferences {
  try {
    const saved = JSON.parse((storage ?? window.localStorage).getItem(storageKey) || 'null') as Partial<ReaderPreferences> | null
    return { theme: saved?.theme === 'dark' ? 'dark' : 'light', view: saved?.view === 'gallery' ? 'gallery' : 'list' }
  } catch {
    return { theme: 'light', view: 'list' }
  }
}

export function saveReaderPreferences(preferences: ReaderPreferences, storage?: Pick<Storage, 'setItem'>) {
  try {
    (storage ?? window.localStorage).setItem(storageKey, JSON.stringify(preferences))
  } catch {
    // Browsing and switching preferences still work when storage is unavailable.
  }
}
