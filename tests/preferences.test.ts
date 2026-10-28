import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readReaderPreferences, saveReaderPreferences } from '../src/reader-preferences.ts'

const key = 'pitchside:reader-preferences:v1'

test('저장한 다크 모드와 갤러리 보기를 다시 불러온다', () => {
  const values = new Map<string, string>()
  const storage = {
    getItem: (name: string) => values.get(name) ?? null,
    setItem: (name: string, value: string) => { values.set(name, value) },
  }
  saveReaderPreferences({ theme: 'dark', view: 'gallery' }, storage)
  assert.deepEqual(readReaderPreferences(storage), { theme: 'dark', view: 'gallery' })
  assert.equal(values.has(key), true)
})

test('손상되거나 알 수 없는 설정은 지원하는 기본 보기로 복구한다', () => {
  for (const value of ['invalid json', 'null', '{"theme":"unknown","view":"tiles"}']) {
    assert.deepEqual(readReaderPreferences({ getItem: () => value }), { theme: 'light', view: 'list' })
  }
  assert.deepEqual(readReaderPreferences({ getItem: () => '{"theme":"dark","view":"invalid"}' }), { theme: 'dark', view: 'list' })
})

test('브라우저 저장소가 차단되어도 설정 읽기와 저장이 화면을 중단하지 않는다', () => {
  assert.deepEqual(readReaderPreferences({ getItem: () => { throw new Error('blocked') } }), { theme: 'light', view: 'list' })
  assert.doesNotThrow(() => saveReaderPreferences({ theme: 'dark', view: 'gallery' }, { setItem: () => { throw new Error('blocked') } }))
})
