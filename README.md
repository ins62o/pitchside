# Pitchside 독자용 프론트엔드

기존 React 19 + Vite 8 + TypeScript 6 환경을 유지한 한국어 K리그 기사 사이트입니다. SEED Design React·CSS를 공통 UI 기반으로 사용하며 Pretendard를 로컬에서 불러옵니다.

## 디자인 기준

[Pitchside 디자인 가이드](DESIGN_GUIDE.md)를 화면 변경의 기준으로 사용합니다. 색상·폰트·레이아웃·사진·인터랙션·반응형 규칙과 팬 매거진의 적용 범위를 정리했습니다.

## 실행

```bash
npm install
npm run dev
```

이미 의존성이 설치돼 있으면 `npm run dev`만 실행하세요. 기본 주소는 `http://localhost:5173/`입니다.

## 화면과 동작

- `/#/`: 주요 기사 1건, 보조 주요 기사 3건, 최신 기사 목록
- `/#/articles`: 전체 기사, K리그1·K리그2, 기사 유형 필터, 제목·요약 검색
- `/#/magazine`: 밝은 팬 매거진 표지·사진 갤러리·다섯 주제·특집 기사 3편, 기사 상세 및 매거진 복귀
- `/#/articles/before-kickoff`: 기사 상세, 중간 제목·인용문·사진 설명·관련 기사
- 검색창은 목록 제목 옆 돋보기로 열고 닫습니다. 열면 입력창에 포커스가 이동하며 Esc로 닫을 수 있습니다. 검색 결과 주소에서는 검색창이 열린 상태로 표시됩니다.
- 홈 최신 기사는 목록형으로 고정합니다. 전체 기사 목록에서만 목록형·갤러리형을 선택할 수 있습니다.
- 목록형은 등장 효과 없이 즉시 표시합니다. 주요 기사·갤러리·관련 기사 카드는 화면에 들어올 때 여유 있게 순차적으로 나타납니다. 움직임 줄이기 설정에서는 즉시 표시합니다. 보기 선택은 이름과 도움말이 연결된 아이콘 버튼으로 표시합니다.
- 헤더에서 라이트·다크 모드를 전환하며, 선택한 테마와 보기 방식은 브라우저에 저장됩니다. 기사 상세와 팬 매거진에도 같은 테마를 적용합니다.
- 검색·필터는 함께 적용되며 주소에 남아 새로고침·뒤로 가기를 지원합니다.
- 기사 카드와 목록 행은 사진·제목·요약·기자 정보·안쪽 여백 전체를 클릭해 상세로 이동합니다. 카드마다 하나의 키보드 링크를 제공하며 목록에서 기사를 열면 본문 끝의 ‘기사 목록으로’ 링크로 검색·필터 조건에 돌아갈 수 있습니다.
- 결과 없음 안내, 검색어 지우기, 전체 초기화, 없는 기사 안내를 제공합니다.
- 모바일은 중요 기사 순서를 유지하고 목록 썸네일을 오른쪽에 배치합니다.
- 사진이 없거나 불러오지 못하면 공통 대체 이미지가 표시됩니다.

## SEED Design

- `@seed-design/react` 3.0.1, `@seed-design/css` 3.0.3, `@seed-design/vite-plugin` 2.1.1을 설치했습니다. 버전 범위는 `package.json`, 실제 설치 버전은 lockfile에서 관리합니다.
- `src/main.tsx`에서 SEED 기본 CSS를 불러오고 Vite 플러그인이 사용한 컴포넌트 CSS를 연결합니다.
- `seed-design.json`은 React·TypeScript, 스니펫 위치 `src/seed-design`, 익명 사용 데이터 수집 끄기로 설정했습니다. `seed-design/*` 별칭은 TypeScript와 Vite 양쪽에서 해석합니다.
- 검색 입력창은 SEED `TextField`를 사용하고, 버튼은 `ActionButton`, 기사 유형 필터는 `ToggleButton`을 사용합니다. 페이지 이동 버튼은 `asChild`로 실제 링크를 유지합니다.
- `src/seed-theme.css`에서 SEED의 밝은 회색 표면·차콜 강조색과 읽기 대비를 설정합니다. 메인 1+3 배치를 유지하며 공통 타이포·테마를 적용합니다. 기사 상세는 별도 제목 카드 없이 도입부·사진·본문이 같은 폭과 기준선으로 이어집니다.
- 기사 사이트와 팬 매거진은 루트의 SEED 색상 모드를 함께 사용합니다. 기본은 라이트이며 헤더 버튼으로 다크 모드와 전환합니다. 본문은 대표 사진과 같은 폭으로 배치하고, 데스크톱 18px·모바일 17px/행간 1.82를 유지합니다.

새 스니펫이 필요할 때 프로젝트 루트에서 공식 CLI를 실행합니다. CLI는 프로젝트 의존성에 상시 설치하지 않습니다.

```bash
npx @seed-design/cli@latest add ui:action-button
npx @seed-design/cli@latest compat
```

공식 문서: [Vite 설치](https://seed-design.io/react/getting-started/installation/vite), [테마](https://seed-design.io/react/getting-started/styling/theming), [CLI](https://seed-design.io/react/getting-started/cli/commands).

## 데이터와 스타일

- `src/reader-data.ts`: 독자 화면에서 사용하는 12건의 기사, 사진, 필터·관련 기사 함수
- `src/ArticleMeta.tsx`: 메인·목록·상세·팬 매거진에서 함께 사용하는 분류·기사 유형·기자·날짜·읽기 시간 표시
- `src/reading-time.ts`: 현재 본문·중간 제목·인용문의 공백 제외 글자 수로 예상 읽기 시간을 자동 계산합니다. 분당 500자 기준으로 올림하며 최소 1분입니다. 기사별 고정값이나 기자의 별도 입력은 사용하지 않습니다.
- `src/App.tsx`: 메인·목록·상세와 기존 hash 기반 화면 이동
- `src/App.css`, `src/index.css`: 기사 편집, 반응형, 접근성, 사진과 같은 본문 폭, 18px(모바일 17px)
- `src/seed-theme.css`: SEED 공개 토큰, 라이트·다크 색상, 은은한 신문 배경과 보기 전환 컨트롤
- `public/textures`: 직접 제작한 SVG 신문 지면 패턴과 종이 입자, 본문 중심부에서 흐려지는 배경 장식
- `src/ReaderControls.tsx`, `src/reader-preferences.ts`: 공유 보기·테마 컨트롤과 브라우저 설정 저장
- `src/seed-design/ui`: 공식 버튼·로딩 표시·유형 필터 스니펫
- `src/MagazinePage.tsx`, `src/MagazinePage.css`: SEED 버튼·배지·타이포그래피와 밝은 카드로 구성한 팬 매거진
- `public/fonts`: Pretendard 및 SIL Open Font License

기사·필자·인터뷰·인용문은 화면 구성을 위해 작성한 원고이며 실제 취재 자료가 아닙니다. 사진 4장은 특정 경기·인물과 무관한 AI 생성 이미지로, 색상 효과 없이 사용합니다. 사진 원본 생성 프롬프트는 `ASSET-PROMPTS.md`에 있습니다.

이번 화면에는 로그인·회원가입·기자용 작성·관리자·백엔드가 없습니다. 이전 로컬 CMS 소스는 보존했지만 현재 앱 진입점이나 독자 데이터에 연결하지 않습니다. 기존 브라우저 저장 데이터도 변경하지 않습니다.

## 검사

```bash
npm test
npm run build
```

운영 배포 전에는 실제 콘텐츠와 사진 권한을 확보하고, 서버 연동 및 기사별 URL·검색/공유 메타데이터를 설계해야 합니다. 현재는 로컬 검토를 위해 hash 주소와 `noindex` 설정을 사용합니다.
