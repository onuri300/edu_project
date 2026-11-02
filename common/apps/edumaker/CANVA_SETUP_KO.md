# Canva 웹앱 연결

현재 Codex의 Canva 계정 조회는 확인했습니다. 웹앱용 OAuth는 별도 Client ID/Secret과 사용자 승인이 필요하므로 실제 디자인 생성은 아직 검증 전입니다.

1. https://www.canva.com/developers 에서 연동 앱을 만들고 Client ID와 Secret을 발급합니다.
2. 권한: `design:content:write`, `design:meta:read`.
3. 콜백: `http://127.0.0.1:5173/api/canva/callback`. 웹앱도 동일한 주소로 접속합니다.
4. `.dev.vars.example`을 참고해 무시되는 `.dev.vars`에 값을 입력합니다. 채팅에 Secret을 붙여넣지 않습니다.
5. `node scripts/canva-key.mjs`로 서버 암호화 키를 생성합니다. 기존 키는 덮어쓰지 않습니다.
6. 로컬 DB에 `drizzle/0002_canva_connections.sql`을 한 번 적용합니다. 2026-10-06 이 PC에서는 적용 여부를 인수인계 문서에서 확인합니다.
7. `pnpm dev` 재시작 → 개발용 로그인 → 교안 탭 → Canva 계정 연결 → Canva에서 직접 승인 → 연결 상태 확인.

토큰은 사용자별로 D1에 AES-GCM 암호화해 보관합니다. Client Secret과 암호화 키는 서버 설정에서만 읽습니다. 암호화 키를 잃으면 계정을 다시 연결해야 합니다.

생성 버튼은 현재 교안의 순서·본문·출처·노트를 Canva AI 요청에 포함합니다. Canva AI 크레딧을 사용하며 API는 미리보기입니다. 내용과 발표자 노트가 정확하게 반영되었는지는 결과를 검토해야 합니다. 100장 또는 슬라이드당 본문·노트·출처 2000자를 넘으면 조용히 자르지 않고 오류로 안내합니다. 생성 결과 확인은 새 디자인을 추가로 만들지 않습니다.

공식 참고: https://www.canva.dev/docs/apps/rest-apis/authentication/ 및 https://www.canva.dev/docs/apps/rest-apis/reference/generations/create-design-generation-job/
