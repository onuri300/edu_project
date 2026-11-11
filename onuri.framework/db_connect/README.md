# 데이터베이스 연결

`browser/`는 Supabase 브라우저 SDK와 공지사항 연결 설정을 포함합니다. 새 사이트의 페이지에서 SDK를 먼저 로드하고, 그 다음 `notice-client.js`를 로드하면 `window.eduNoticeClient`로 연결을 사용할 수 있습니다. 다른 Supabase 프로젝트를 쓸 때는 `notice-client.js`의 프로젝트 URL과 공개 키를 교체하세요. 공지 목록과 관리 화면은 해당 사이트의 페이지 코드에서 구현합니다.

`supabase/migrations/`는 Supabase 변경 이력입니다. Supabase CLI를 사용할 때 `onuri.framework/db_connect`를 작업 디렉터리로 사용하세요. 정적 사이트 빌드에는 `browser/`만 포함됩니다.
