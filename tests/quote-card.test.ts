import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fitCardQuote, prepareQuote, wrapCardText } from '../src/quote-card.ts'
import { parseMagazineText } from '../src/magazine-text.ts'

test('인용문은 공백을 정리하고 빈 내용과 카드에 담을 수 없는 길이를 거절한다', () => {
  assert.equal(prepareQuote('  우리가\n 함께\t부르는 노래  '), '우리가 함께 부르는 노래')
  assert.equal(prepareQuote(' \n '), null)
  assert.equal(prepareQuote('가'.repeat(241)), null)
  assert.equal(prepareQuote('가'.repeat(240)), '가'.repeat(240))
  assert.equal(prepareQuote('⚽️'.repeat(240)), '⚽️'.repeat(240))
})

test('카드 줄바꿈은 폭을 지키고 한글·이모지·명시적 줄바꿈을 보존한다', () => {
  const measure = (text: string) => [...new Intl.Segmenter('ko', { granularity: 'grapheme' }).segment(text)].length * 10
  assert.deepEqual(wrapCardText('우리의 토요일', measure, 40), ['우리의', '토요일'])
  assert.deepEqual(wrapCardText('가나다라마', measure, 20), ['가나', '다라', '마'])
  assert.deepEqual(wrapCardText('함께⚽️가자', measure, 30), ['함께⚽️', '가자'])
  assert.deepEqual(wrapCardText('첫 문장\n다음 문장', measure, 100), ['첫 문장', '다음 문장'])
})

test('매거진 강조는 볼드와 밑줄을 지원하고 HTML을 실행 가능한 형식으로 바꾸지 않는다', () => {
  assert.deepEqual(parseMagazineText('우리는 **함께** __노래한다__.'), [
    { text: '우리는 ', style: 'plain' }, { text: '함께', style: 'bold' },
    { text: ' ', style: 'plain' }, { text: '노래한다', style: 'underline' }, { text: '.', style: 'plain' },
  ])
  assert.deepEqual(parseMagazineText('<script>alert(1)</script> **미완성'), [{ text: '<script>alert(1)</script> **미완성', style: 'plain' }])
})

test('카드는 높이뿐 아니라 가로 폭도 검사해 표시할 수 없는 문장은 거절한다', async () => {
  const { fitCardQuote } = await import('../src/quote-card.ts')
  assert.equal(typeof fitCardQuote, 'function')
  const measure = (value: string, size: number) => Array.from(value).filter(char => char !== '\u200d').length * size
  assert.equal(fitCardQuote('😀\u200d'.repeat(40) + '😀', measure, false), null)
  const layout = fitCardQuote('가'.repeat(240), measure, true)
  assert.ok(layout)
  assert.equal(layout.lines.join(''), '가'.repeat(240))
  assert.ok(layout.lines.every(line => measure(line, layout.size) <= 828))
  assert.ok(layout.lines.length * layout.size * 1.5 <= 610)
})

test('긴 문장도 크게 보기를 켜면 글자가 커지고 원문은 잘리지 않는다', () => {
  const text = '가'.repeat(240)
  const measure = (value: string, size: number) => Array.from(value).length * size
  const normal = fitCardQuote(text, measure, false)
  const large = fitCardQuote(text, measure, true)
  assert.ok(normal && large)
  assert.ok(large.size > normal.size)
  for (const layout of [normal, large]) {
    assert.equal(layout.lines.join(''), text)
    assert.ok(layout.lines.every(line => measure(line, layout.size) <= 828))
    assert.ok(layout.lines.length * layout.size * 1.5 <= 610)
  }
})
