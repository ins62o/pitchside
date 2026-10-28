import { test } from 'node:test'
import assert from 'node:assert/strict'
import { estimateReadingMinutes } from '../src/reading-time.ts'
import type { ReaderArticle } from '../src/reader-data.ts'

test('빈 본문도 예상 읽기 시간은 최소 1분이다', () => {
  assert.equal(estimateReadingMinutes([]), 1)
  assert.equal(estimateReadingMinutes([{ paragraphs: [' \n\t　'] }]), 1)
})

test('500자 단위 경계를 넘으면 예상 읽기 시간을 올림한다', () => {
  assert.equal(estimateReadingMinutes([{ paragraphs: ['가'.repeat(500)] }]), 1)
  assert.equal(estimateReadingMinutes([{ paragraphs: ['가'.repeat(501)] }]), 2)
  assert.equal(estimateReadingMinutes([{ paragraphs: ['가'.repeat(1000)] }]), 2)
  assert.equal(estimateReadingMinutes([{ paragraphs: ['가'.repeat(1001)] }]), 3)
})

test('띄어쓰기와 줄바꿈은 읽기 분량에 포함하지 않는다', () => {
  assert.equal(estimateReadingMinutes([{ paragraphs: ['가 '.repeat(500) + '\n\t　'] }]), 1)
})

test('여러 문단과 중간 제목, 인용문을 모두 읽기 분량에 포함한다', () => {
  assert.equal(estimateReadingMinutes([
    { heading: '가'.repeat(25), paragraphs: ['나'.repeat(200), '다'.repeat(200)], quote: { text: '라'.repeat(26), speaker: '취재원' } },
    { paragraphs: ['마'.repeat(50)] },
  ]), 2)
})

test('본문을 늘리거나 줄이면 최신 원고로 읽기 시간을 다시 계산한다', () => {
  const body: ReaderArticle['body'] = [{ paragraphs: ['가'.repeat(500)] }]
  assert.equal(estimateReadingMinutes(body), 1)
  body[0].paragraphs.push('나'.repeat(501))
  assert.equal(estimateReadingMinutes(body), 3)
  body[0].paragraphs.pop()
  assert.equal(estimateReadingMinutes(body), 1)
})
