# 배포

이 프로젝트는 Vite 정적 빌드와 hash 기반 주소를 사용합니다. 서버 기능은 필요하지 않으며, `dist/`를 비공개 S3 버킷에 저장하고 CloudFront OAC로 제공하는 구성을 사용합니다. 이 문서는 배포 준비 과정에서 작성했으며 AWS 리소스, DNS 및 GitHub 저장소는 아직 연결되지 않았습니다.

## GitHub Actions

`.github/workflows/deploy.yml`은 `main` 브랜치의 push 또는 수동 실행 시 Node.js 24로 의존성을 설치하고 린트, 테스트, 빌드를 실행합니다. 이후 GitHub OIDC로 AWS 역할을 맡아 빌드 결과를 S3에 업로드하고 CloudFront 캐시를 무효화합니다. 수동 실행도 `main`에서만 배포합니다.

배포할 저장소의 Actions 변수에 다음 값을 설정해야 합니다. 값과 리소스는 배포 대상이 확정된 후 확인합니다.

| 변수 | 값 |
| --- | --- |
| `AWS_REGION` | S3 버킷 리전 (예: `ap-northeast-2`) |
| `AWS_ACCOUNT_ID` | 대상 AWS 계정 ID |
| `AWS_ROLE_ARN` | GitHub OIDC용 IAM 역할 ARN |
| `S3_BUCKET` | 이 사이트 전용 S3 버킷 이름 |
| `CLOUDFRONT_DISTRIBUTION_ID` | 이 사이트의 CloudFront 배포 ID |

IAM 역할의 신뢰 정책은 GitHub OIDC 공급자, 대상 저장소와 `refs/heads/main`으로 제한합니다. 권한은 해당 버킷에 대한 목록 조회 및 객체 업로드와 해당 CloudFront 배포의 무효화 생성에 필요한 범위로만 부여합니다. 현재 앱에는 빌드 시 필요한 환경변수가 확인되지 않았습니다.

워크플로는 이전 객체를 삭제하지 않습니다. 새 에셋을 먼저 업로드한 뒤 `index.html`을 업로드하고 캐시를 무효화합니다. 이전 버전으로 되돌릴 때는 배포 브랜치에서 해당 변경을 되돌린 커밋을 만들어 같은 워크플로를 실행하고 사이트를 확인합니다. 이전 버전의 실제 복구는 배포 구성 완료 후 검증해야 합니다.

## AWS와 도메인

- S3 퍼블릭 액세스를 차단하고 CloudFront OAC와 배포별 버킷 정책을 설정합니다.
- CloudFront 기본 루트 객체는 `index.html`, HTTP 요청은 HTTPS로 리디렉션합니다.
- CloudFront용 ACM 인증서는 `us-east-1`에서 발급하고 서비스 도메인을 DNS로 검증합니다.
- 기존 권한 DNS 및 레코드와 DNSSEC 상태를 확인한 다음 필요한 레코드만 변경합니다. 네임서버 이전이 필요한 경우 기존 레코드를 먼저 보존합니다.
- 사이트는 hash 기반 경로이므로 CloudFront에서 모든 403/404를 `index.html`로 바꾸는 설정은 필요하지 않습니다.

서비스 주소는 `www.pitchside.kr`입니다. 2026-10-28 기준 가비아 DNS 화면에는 네임서버 `ns.gabia.co.kr`와 다음 레코드가 표시되었습니다. 이들은 메일 인증·수신에 사용되므로 네임서버를 이전할 때 그대로 보존해야 합니다. DNSSEC 상태는 아직 확인되지 않았으며 DNS는 변경하지 않았습니다.

| 타입 | 호스트 | 값 | TTL / 우선순위 |
| --- | --- | --- | --- |
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDZjP0or6cX4QQlKKJaiFVUPvt2UgyNBYYi5bS+z2F7z6f3N/qa+DdZxNPcanZjXhBFrQ2yuzsHejUNl5uOpkFy+hHinildYhWNFl/HwdJHIyLmbb/ZHtOrW3sM0lgbU1JXNNnN358wGeLYsdsPHPdTaG0X+GyyLHw1Ax7bVqVv+QIDAQAB` | 3600 |
| CNAME | `rsend` | `rsend-apne1.forge.rmta.net.` | 3600 |
| CNAME | `send` | `send.forge.rmta.net.` | 3600 |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | 3600 |
| MX | `@` | `receive-apne1.forge.rmta.net.` | 3600 / 10 |

AWS 계정은 S3와 CloudFront에 접근할 때 계정 설정 완료 안내로 이동합니다. 리소스 ID, 인증서, DNS 변경 및 확인 결과는 실제 설정 후 이 문서에 추가합니다. 현재 원고는 예시 콘텐츠이며 `noindex, nofollow` 설정이 적용되어 있습니다.
