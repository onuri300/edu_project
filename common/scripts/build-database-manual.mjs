import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const names = {
  board_posts: '게시판 글', canva_connections: 'Canva 연결', canva_jobs: 'Canva 작업',
  canva_link_categories: 'Canva 링크 분류', canva_links: 'Canva 링크',
  category_images: '분류 이미지', courses: '강좌', journal_categories: '수업 일지 분류',
  journals: '수업 일지', news_articles: '뉴스 기사', sessions: '차시',
  slide_sources: '슬라이드 출처', slides: '슬라이드', storage_credentials: '저장소 자격 정보',
  admin_users: '관리자 계정', users: '사용자', identities: '인증 식별 정보',
  audit_log_entries: '인증 감사 기록', custom_oauth_providers: '사용자 지정 OAuth 공급자',
  flow_state: '인증 흐름 상태', instances: '인증 인스턴스', mfa_amr_claims: '다중 인증 방식 클레임',
  mfa_challenges: '다중 인증 검증 요청', mfa_factors: '다중 인증 수단',
  mfa_recovery_code_sets: '다중 인증 복구 코드 묶음', mfa_recovery_codes: '다중 인증 복구 코드',
  oauth_authorizations: 'OAuth 인가', oauth_client_states: 'OAuth 클라이언트 상태',
  oauth_clients: 'OAuth 클라이언트', oauth_consents: 'OAuth 동의', one_time_tokens: '일회용 토큰',
  refresh_tokens: '갱신 토큰', saml_providers: 'SAML 공급자', saml_relay_states: 'SAML 중계 상태',
  schema_migrations: '스키마 마이그레이션', scim_tokens: 'SCIM 토큰', scim_users: 'SCIM 사용자',
  sso_domains: 'SSO 도메인', sso_providers: 'SSO 공급자',
  webauthn_challenges: 'WebAuthn 검증 요청', webauthn_credentials: 'WebAuthn 자격 정보',
  pg_stat_statements: 'SQL 실행 통계', pg_stat_statements_info: 'SQL 통계 수집 정보',
  messages: '실시간 메시지', subscription: '실시간 구독', bucket_lifecycle_states: '버킷 수명 주기 상태',
  buckets: '파일 버킷', buckets_analytics: '분석 버킷', buckets_vectors: '벡터 버킷',
  lifecycle_abandoned_artifacts: '수명 주기 미완료 자료', migrations: '마이그레이션',
  objects: '저장 파일', s3_multipart_uploads: 'S3 분할 업로드',
  s3_multipart_uploads_parts: 'S3 분할 업로드 조각', vector_indexes: '벡터 인덱스',
  secrets: '보안 저장 항목', decrypted_secrets: '보안 저장 항목 조회 뷰',
};
const columns = {
  id: '식별자', owner: '소유자', user_id: '사용자 식별자', title: '제목', content: '내용',
  published: '공개 여부', author_id: '작성자 식별자', created_at: '생성 시각', updated_at: '수정 시각',
  board_type: '게시판 구분', updated_by: '수정자 식별자', tokens: '연결 토큰',
  updated: '수정 시각', created: '생성 시각', course_id: '강좌 식별자', category_id: '분류 식별자',
  date: '날짜', url: '주소', slot: '이미지 위치', mime: '파일 형식', data: '데이터',
  caption: '이미지 설명', topic: '주제', audience: '수업 대상', planned_date: '예정일',
  input_options: '입력 옵션', metadata: '메타데이터', journal_defaults: '일지 기본값',
  version: '버전', start_date: '시작일', end_date: '종료일', guidance: '작성 안내',
  goal_count: '목표 수', topic_count: '주제 수', detail_count: '세부 항목 수',
  session_position: '차시 순서', body: '본문', class_date: '수업일', activities: '활동',
  actual_details: '실제 수업 세부 내용', outline: '개요', deleted_at: '삭제 시각',
  position: '순서', article: '기사', plan: '수업 계획', slide_position: '슬라이드 순서',
  session_number: '차시 번호', kind: '종류', notes: '발표 노트', extra: '추가 정보',
  key_hash: '접근 키 해시',
};
const cell = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const key = table => table.schema + '.' + table.name;

export async function buildDatabaseManual(source) {
  const snapshot = JSON.parse(await readFile(path.join(source, 'common/data/database-schema.json'), 'utf8'));
  const tables = snapshot.tables.map(table => ({
    ...table,
    korean: table.schema === 'auth' && table.name === 'sessions' ? '인증 세션' : names[table.name] || table.name,
  }));
  const data = {
    ...snapshot, tables,
    columns: snapshot.columns.map(column => ({ ...column, korean: columns[column.name] || column.comment || '' })),
  };
  const lines = [
    '# 운영 데이터베이스 전체 스키마',
    '',
    '운영 PostgreSQL 카탈로그를 읽기 전용으로 조회한 스냅샷입니다. 조회 시각은 ' + snapshot.captured_at + '입니다.',
    '',
    '한글명은 문서에서 사용하는 설명 이름입니다. DB 코멘트가 있으면 별도로 표시합니다. 일반 테이블, 뷰, Supabase 관리 스키마를 함께 수록합니다.',
    '',
    '| 스키마 | 테이블·뷰 수 |',
    '|---|---|',
    ...snapshot.schemas.map(schema => '| ' + schema.name + ' | ' + tables.filter(table => table.schema === schema.name).length + ' |'),
    '',
    '## 테이블과 컬럼',
  ];
  for (const table of tables) {
    const constraints = data.constraints.filter(item => item.schema === table.schema && item.table === table.name);
    lines.push('', '### ' + key(table) + ' · ' + table.korean, '',
      '종류 ' + ({ r: '테이블', p: '파티션 테이블', v: '뷰', m: '구체화 뷰' }[table.kind]) +
      ' · RLS ' + (table.kind === 'v' ? '뷰 원본의 정책과 보안 옵션 확인' : table.rls ? '사용' : '미사용'), '',
      '| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |',
      '|---|---|---|---|---|---|');
    for (const column of data.columns.filter(item => item.schema === table.schema && item.table === table.name)) {
      const keys = constraints.filter(item => item.columns?.includes(column.name))
        .map(item => ({ p: 'PK', f: 'FK', u: 'UNIQUE' }[item.kind])).filter(Boolean);
      lines.push('| ' + [column.name, [column.korean, column.comment].filter(Boolean).join(' / '), column.type,
        column.nullable ? '예' : '아니오', column.identity ? 'IDENTITY' : column.default, keys.join(', ')].map(cell).join(' | ') + ' |');
    }
    for (const constraint of constraints) lines.push('', '- ' + cell(constraint.name) + ' — ' + cell(constraint.definition));
    for (const index of data.indexes.filter(item => item.schema === table.schema && item.table === table.name)) {
      lines.push('', '- 인덱스 ' + cell(index.name) + ' — ' + cell(index.definition));
    }
  }
  lines.push('', '## 애플리케이션 함수와 트리거', '',
    '| 스키마·함수 | 인자 | 반환형 |', '|---|---|---|');
  for (const fn of data.functions || []) lines.push('| ' + [fn.schema + '.' + fn.name, fn.arguments, fn.result].map(cell).join(' | ') + ' |');
  for (const trigger of data.triggers || []) lines.push('', '- ' + cell(trigger.schema + '.' + trigger.name) + ' — ' + cell(trigger.definition));
  lines.push('', '## 공개 뷰 정의');
  for (const view of data.views || []) lines.push('', '### ' + view.schema + '.' + view.name, '', '~~~sql', view.definition, '~~~');
  lines.push('', '## RLS 정책', '', '| 테이블 | 정책 | 역할 | 동작 | USING | WITH CHECK |', '|---|---|---|---|---|---|');
  for (const policy of data.policies || []) lines.push('| ' + [policy.schema + '.' + policy.table, policy.name,
    policy.roles.join(', '), policy.command, policy.using, policy.check].map(cell).join(' | ') + ' |');
  await writeFile(path.join(source, 'mo_tools/docs/08-database-schema.md'), lines.join('\n') + '\n');
  return data;
}
