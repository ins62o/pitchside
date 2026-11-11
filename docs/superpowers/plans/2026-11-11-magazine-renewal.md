# 팬 매거진 리뉴얼 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 카카오톡에서 합의한 사진 표지·검은 책 선반·밝은 상세를 기존 매거진에 반영한다.
**Architecture:** 기존 페이지와 선반을 유지하고 공유 표지와 상세 전용 밝은 토큰을 적용한다.
**Tech Stack:** React, TypeScript, CSS, Vite. 새 의존성 없음.
**Spec:** `docs/superpowers/specs/2026-11-11-magazine-renewal-design.md`

## Global Constraints

기존 URL·기사 화면·문장 카드·키보드 조작 보존. 현재 예시 콘텐츠 사용. IDE의 현재 작업 디렉터리에서 수정하며, 검증된 변경을 main에 반영하고 GitHub Actions 자동배포를 확인한다.

## Review Focus

모바일 제목·메뉴 겹침, 사진 실패, 움직임 줄이기, 선반에서 상세로 전환, 기사 화면으로 돌아갈 때 테마 복원을 브라우저에서 확인한다.

### Task 1: 사진 표지와 선반 배치

**Files:** `src/MagazineLanding.tsx`, `src/MagazineLanding.css`
**Interfaces:** `MagazineCover({ photo, title, page })`를 상세에서도 사용한다.

- [x] 기존 첫 화면을 브라우저에서 확인한다.
- [x] 공유 표지·상단 제호를 만들고 선반을 표지 바로 아래에 배치한다.
- [x] 기존 소개·Stories 링크와 선반 조작을 확인한다.

### Task 2: 밝은 상세와 기존 기능 연결

**Files:** `src/MagazinePage.tsx`, `src/MagazinePage.css`, `src/MagazineShelf.tsx`
**Interfaces:** Task 1의 표지, 기존 `QuoteShare`와 `ReaderArticle`을 사용한다.

- [x] 상세 시작에 표지를 넣고 사진·본문을 흰 지면에 배치한다.
- [x] 공용 문장 카드 토큰과 페이지 바깥 배경을 상세에 맞춘다.
- [x] 선반 확대 전환이 표지 사진으로 연결되도록 맞춘다.

### Task 3: 검증과 문서

**Files:** `DESIGN_GUIDE.md`, `README.md`

- [x] `npm test`와 `npm run build`를 실행한다.
- [x] 브라우저에서 메인→선반→상세→문장 카드와 모바일 배치를 확인한다.
- [x] 디자인 가이드와 화면 설명을 최종 구현에 맞춘다.

레이아웃·스타일 변경은 별도 구현 복제 테스트를 추가하지 않고 기존 테스트와 브라우저로 검증한다.

## 검증 결과

- 기존 테스트 26개 통과. TypeScript·Vite 프로덕션 빌드 통과. `git diff --check` 통과.
- Chrome 데스크톱과 iPhone 16 에뮬레이션(393×852)에서 표지·선반·상세 배치 확인.
- 선반 다음 권 선택 → 표지 확대 → 해당 상세 이동 확인. 문장 카드 미리보기와 빈 문장 오류·버튼 비활성화 확인.
- 기사 다크 모드를 유지한 상태에서도 상세·문장 카드는 밝게 표시되고, 기사로 돌아가면 다크 모드로 복원됨을 확인. 검증 후 원래 라이트 설정으로 복원.
- 새로고침 후 콘솔 오류 0개. CSS 편집 중 발생한 기존→새 effect 의존성 배열의 Fast Refresh 경고는 새로고침 후 재발하지 않음.
- 독립 코드 검토의 사진 실패 대체 화면 대비와 문장 카드 오류 색상 두 건을 보완. 사진 대체 배경은 지면 토큰을 사용하고 오류 글자는 `#B42318`로 표시.
- 실제 기기의 공유 메뉴·인스타그램 전달과 발행용 콘텐츠 교체는 이번 검증 범위에 포함하지 않음.

## 추가 반영

- 메인 첫 표지에 스크롤 패럴랙스를 적용하고, 상단은 매거진·Articles 두 버튼으로 정리.
- 선반 경계 페이드와 키보드 초점 표시를 보완.
- 스크롤 훅과 공통 프레임 처리를 `src/magazine-scroll.ts`로 분리하여 React Fast Refresh 린트 규칙 준수.
