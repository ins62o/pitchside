import { Icon } from '@seed-design/react'
import { ActionButton } from 'seed-design/ui/action-button'
import { ToggleButton } from 'seed-design/ui/toggle-button'
import type { ArticleView, ReaderTheme } from './reader-preferences'

export type ArticleViewProps = { view: ArticleView; onViewChange: (view: ArticleView) => void }

export function ArticleViewSwitch({ view, onViewChange }: ArticleViewProps) {
  return <div className="view-switch" data-view={view} role="group" aria-label="기사 보기 방식">
    <ToggleButton className="ui-button view-option" variant="neutralWeak" size="small" pressed={view === 'list'} onPressedChange={() => onViewChange('list')} aria-label="목록형 보기" title="목록형 보기">
      <Icon svg={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>} />
    </ToggleButton>
    <ToggleButton className="ui-button view-option" variant="neutralWeak" size="small" pressed={view === 'gallery'} onPressedChange={() => onViewChange('gallery')} aria-label="갤러리형 보기" title="갤러리형 보기">
      <Icon svg={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>} />
    </ToggleButton>
  </div>
}

export function ThemeToggle({ theme, onToggle }: { theme: ReaderTheme; onToggle: () => void }) {
  const label = theme === 'light' ? '다크 모드' : '라이트 모드'
  return <ActionButton className="ui-button theme-toggle" variant="neutralOutline" layout="iconOnly" size="small" type="button" onClick={onToggle} aria-label={label + '로 전환'} title={label + '로 전환'}>
    <Icon svg={theme === 'light'
      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" /></svg>
      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>} />
  </ActionButton>
}
