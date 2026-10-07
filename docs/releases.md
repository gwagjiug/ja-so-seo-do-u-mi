# 자동 릴리스 운영

main에 릴리스 대상 변경이 들어오면 GitHub Actions가 버전 파일, CHANGELOG, Git 태그와 GitHub Release를 갱신한다. 별도 릴리스 PR이나 npm 배포는 없다. Node 도구는 릴리스 유지보수에만 사용하며 스킬 사용자에게 Node 설치를 요구하지 않는다.

## 변경 종류와 버전

PR 제목을 Conventional Commits 형식으로 작성하고 **Squash and merge**한다. 병합 화면에서도 커밋 제목을 유지한다. 분석 기준은 PR 제목 자체가 아니라 main에 들어온 커밋 메시지다. 일반 merge/rebase를 사용하면 포함된 개별 커밋도 같은 규칙을 따라야 한다.

| 종류 | 예시 | 0.2.0 기준 다음 버전 |
| --- | --- | --- |
| 오류 수정 | `fix: 진단 모드 분기 수정` | 0.2.1 |
| 성능 개선 | `perf: 글자수 계산 개선` | 0.2.1 |
| 기능 추가 | `feat: 여러 문항 일괄 처리` | 0.3.0 |
| 호환성 변경 | `feat!: 입력 형식 변경` 또는 본문의 `BREAKING CHANGE:` | 1.0.0 |
| 문서·테스트·CI·유지보수 | `docs:`, `test:`, `ci:`, `chore:`, 일반 `refactor:` 등 | 릴리스 없음 |

여러 변경이 있으면 가장 큰 증가 수준을 적용한다. 0.x에서도 호환성 변경은 major 증가로 처리한다. 자동 릴리스 커밋은 `chore(release): ... [skip ci]` 형식이며 다음 릴리스를 유발하지 않는다.

## 최초 설정: GitHub App

main은 PR과 승인을 요구하므로 기본 `GITHUB_TOKEN`만으로 버전 커밋을 직접 푸시할 수 없다. 릴리스용 GitHub App을 등록한다. 개인 액세스 토큰을 대신 사용하거나 main 전체 보호를 해제하지 않는다.

1. [GitHub App 생성](https://github.com/settings/apps/new)에서 저장소 소유 계정용 App을 만든다.
   - 이름: 계정 내에서 고유한 릴리스 봇 이름.
   - Homepage URL: 이 저장소 URL.
   - Webhook은 비활성화하고 사용자 인증·콜백 URL은 사용하지 않는다.
   - Repository permissions: **Contents → Read and write**. Metadata 읽기는 기본 권한이다.
   - 이 계정에만 설치 가능한 App으로 만들고 **이 저장소에만 설치**한다.
2. App 설정의 App ID를 기록하고 private key를 생성한다. 키를 저장소나 채팅에 붙이지 않는다.
3. 저장소 **Settings → Environments → New environment**에서 `release`를 만든다.
   - Deployment branches and tags: **Selected branches and tags → branch `main`만 허용**.
   - 자동 실행을 원하므로 환경 승인자는 지정하지 않는다.
   - Environment variable `RELEASE_APP_ID`: App ID.
   - Environment secret `RELEASE_APP_PRIVATE_KEY`: 생성한 PEM 키 전체.
4. **Settings → Rules → Rulesets → default → Bypass list**에 설치한 App을 추가한다.
   - 직접 버전 커밋을 푸시해야 하므로 App의 bypass mode는 **Always allow**로 지정한다.
   - 기존 PR 승인·강제 푸시 금지·삭제 금지 규칙과 기존 bypass 항목은 유지한다.
5. 첫 Verify 실행 후 `Verify release tooling`을 main의 필수 검사로 추가하는 것을 권장한다. 릴리스 봇의 버전 커밋은 위 App 예외로 처리된다.

App ID 또는 키가 없으면 Release 워크플로우는 게시 전에 설정 안내와 함께 실패한다. 저장소 변수나 secret 대신 환경에 보관하고 main으로 제한해야 다른 브랜치가 릴리스 자격 증명에 접근하는 범위를 줄일 수 있다.

## 최초 0.2.0 기준점

`.release-baseline.json`은 자동화 도입 당시 버전인 `0.2.0`을 기록하며 이후 변경하지 않는다.

첫 실행은 main의 first-parent 이력에서 이 파일이 최초로 들어온 커밋을 찾아 `v0.2.0` 태그와 기준 Release를 생성한다. 일반 merge라면 main의 merge commit이 기준이고, squash/rebase라면 파일이 처음 들어온 main 커밋이 기준이다. 그 커밋의 플러그인·스킬 버전과 CHANGELOG가 0.2.0인지 먼저 검사한다.

App 설정이 늦어져 이후 fix 커밋이 쌓여도 기준 태그는 과거 도입 커밋에 붙고, 이후 변경을 다음 버전에 포함한다. 과거 태그를 덮어쓰지 않으며 예상과 다른 기존 태그가 있으면 수동 확인을 요구한다.

자동화 PR을 먼저 병합하고 기준점 생성이 성공한 뒤 `fix/skill-mode-routing`을 병합한다. 중간에 다른 릴리스 대상 변경이 없다면 다음 버전은 `0.2.1`이다. 이후 일반 작업 PR에서는 버전 숫자를 직접 올리지 않는다. main 갱신에 따라 충돌이 나면 main의 릴리스 버전을 유지하고 실제 스킬 변경만 반영한다.

## 실행과 검증

로컬 도구는 **Node 24.15 이상인 Node 24**를 사용한다.

```sh
npm ci --ignore-scripts
npm run verify
npm test
```

- `verify`: 버전 파일·CHANGELOG 일치와 workflow YAML 확인.
- `test`: 실제 commit-analyzer 판정, 버전 동기화, 기준점 생성, 실패 복구 및 임시 bare 저장소에서 semantic-release의 커밋·태그 생성 검증.
- `Verify` PR workflow: PR 제목 검사와 위 검증 실행. 비밀키를 사용하지 않는다.
- `Release` workflow: 현재 main을 체크아웃하고 검증이 통과하면 게시. push 이벤트이므로 PR 병합뿐 아니라 허용된 main 직접 푸시도 처리한다.

GitHub **Actions → Release → Run workflow**에서 branch를 main으로 선택한다. `dry_run`은 기본 true이며, 예상 버전·노트를 확인한 뒤 false로 실행하면 게시한다. dry-run도 App 인증이 필요하다. 최초 dry-run은 runner 안에만 기준 태그를 만들며 원격 태그·Release·버전 파일은 변경하지 않는다. 로컬에서 `npm run release:dry-run`을 실행하면 로컬 기준 태그가 남을 수 있으므로 깨끗한 임시 checkout 사용을 권장한다.

실행을 직렬화하고 매번 최신 main을 읽는다. 연속 push로 대기 실행이 합쳐지더라도 마지막 태그 이후 전체 커밋을 분석한다. 병합마다 반드시 태그 하나를 만드는 정책은 아니며 여러 변경이 한 릴리스에 포함될 수 있다. 실행 도중 main이 앞서가면 강제 푸시하지 않고 다음 실행 또는 main 수동 실행에서 처리한다.

## 실패 후 재실행

- 버전 커밋까지 푸시하고 태그 생성이 실패한 경우: 같은 다음 버전으로 준비 단계를 재실행하며 CHANGELOG 항목을 중복 추가하지 않는다.
- 태그는 있지만 GitHub Release가 없는 경우: 해당 **태그 안의 버전 파일과 CHANGELOG**를 검증한 후 같은 태그의 Release를 생성한다. 최신 main의 내용을 섞지 않는다.
- 태그와 Release가 모두 있으면 재게시하지 않는다.
- 기존 draft Release나 버전 불일치가 있으면 자동 덮어쓰기 대신 실패 원인을 확인한다.

Actions에서 실패 원인을 해결한 뒤 main의 Release workflow를 `dry_run=false`로 실행한다. 오래된 버전을 복구하더라도 최신 태그보다 낮은 버전을 최신 Release로 지정하지 않는다. PR/Issue에 자동 댓글이나 실패 이슈는 만들지 않는다.

## 의존성 관리

Action은 커밋 SHA, Node 릴리스 도구는 정확한 버전과 lockfile로 고정한다. `conventional-changelog-conventionalcommits` 10.x는 현재 release-notes-generator의 writer 8과 호환되지 않으므로 검증된 9.x를 사용한다. 업그레이드 시 전체 통합 테스트를 실행한다.

도입 시 `npm audit`에서 릴리스 도구의 전이 의존성 경고가 확인됐다. `braces`는 수정 버전이 보고되지 않았으며 이 구성에서는 저장소에 고정된 패턴만 사용한다. 기본 의존성에 포함된 npm 게시 플러그인은 설정에서 제외되어 실행되지 않는다. 경고를 숨기거나 강제 메이저 변경으로 해결하지 않고 업스트림 수정 여부를 확인한다.

참고: [semantic-release GitHub Actions](https://semantic-release.org/recipes/ci-configurations/github-actions/), [GitHub App token action](https://github.com/actions/create-github-app-token), [commit-analyzer](https://github.com/semantic-release/commit-analyzer).
