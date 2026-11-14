# 운영 데이터베이스 전체 스키마

public·edumaker 스키마의 운영 PostgreSQL 카탈로그 조회 시각은 2026-11-14T13:50:33.581Z입니다. Supabase 관리 스키마는 이전 스냅샷을 참고용으로 포함합니다.

한글명은 문서에서 사용하는 설명 이름입니다. DB 코멘트가 있으면 별도로 표시합니다. 일반 테이블, 뷰, Supabase 관리 스키마를 함께 수록합니다.

| 스키마 | 테이블·뷰 수 |
|---|---|
| auth | 27 |
| edumaker | 14 |
| extensions | 2 |
| graphql | 0 |
| graphql_public | 0 |
| pgbouncer | 0 |
| public | 6 |
| realtime | 3 |
| storage | 10 |
| supabase_migrations | 1 |
| vault | 2 |

## 테이블과 컬럼

### auth.audit_log_entries · 인증 감사 기록

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| instance_id |  | uuid | 예 |  |  |
| id | 식별자 | uuid | 아니오 |  | PK |
| payload |  | json | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 예 |  |  |
| ip_address |  | character varying(64) | 아니오 | ''::character varying |  |

- audit_log_entries_pkey — PRIMARY KEY (id)

- 인덱스 audit_log_entries_pkey — CREATE UNIQUE INDEX audit_log_entries_pkey ON auth.audit_log_entries USING btree (id)

- 인덱스 audit_logs_instance_id_idx — CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id)

### auth.custom_oauth_providers · 사용자 지정 OAuth 공급자

종류 테이블 · RLS 미사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 | gen_random_uuid() | PK |
| provider_type |  | text | 아니오 |  |  |
| identifier |  | text | 아니오 |  | UNIQUE |
| name | 이름 | text | 아니오 |  |  |
| client_id |  | text | 아니오 |  |  |
| client_secret |  | text | 아니오 |  |  |
| acceptable_client_ids |  | text[] | 아니오 | '{}'::text[] |  |
| scopes |  | text[] | 아니오 | '{}'::text[] |  |
| pkce_enabled |  | boolean | 아니오 | true |  |
| attribute_mapping |  | jsonb | 아니오 | '{}'::jsonb |  |
| authorization_params |  | jsonb | 아니오 | '{}'::jsonb |  |
| enabled |  | boolean | 아니오 | true |  |
| email_optional |  | boolean | 아니오 | false |  |
| issuer |  | text | 예 |  |  |
| discovery_url |  | text | 예 |  |  |
| skip_nonce_check |  | boolean | 아니오 | false |  |
| cached_discovery |  | jsonb | 예 |  |  |
| discovery_cached_at |  | timestamp with time zone | 예 |  |  |
| authorization_url |  | text | 예 |  |  |
| token_url |  | text | 예 |  |  |
| userinfo_url |  | text | 예 |  |  |
| jwks_uri |  | text | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 아니오 | now() |  |
| updated_at | 수정 시각 | timestamp with time zone | 아니오 | now() |  |
| custom_claims_allowlist |  | text[] | 아니오 | '{}'::text[] |  |

- custom_oauth_providers_authorization_url_https — CHECK (authorization_url IS NULL OR authorization_url ~~ 'https://%'::text)

- custom_oauth_providers_authorization_url_length — CHECK (authorization_url IS NULL OR char_length(authorization_url) <= 2048)

- custom_oauth_providers_client_id_length — CHECK (char_length(client_id) >= 1 AND char_length(client_id) <= 512)

- custom_oauth_providers_discovery_url_length — CHECK (discovery_url IS NULL OR char_length(discovery_url) <= 2048)

- custom_oauth_providers_identifier_format — CHECK (identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)

- custom_oauth_providers_identifier_key — UNIQUE (identifier)

- custom_oauth_providers_issuer_length — CHECK (issuer IS NULL OR char_length(issuer) >= 1 AND char_length(issuer) <= 2048)

- custom_oauth_providers_jwks_uri_https — CHECK (jwks_uri IS NULL OR jwks_uri ~~ 'https://%'::text)

- custom_oauth_providers_jwks_uri_length — CHECK (jwks_uri IS NULL OR char_length(jwks_uri) <= 2048)

- custom_oauth_providers_name_length — CHECK (char_length(name) >= 1 AND char_length(name) <= 100)

- custom_oauth_providers_oauth2_requires_endpoints — CHECK (provider_type <> 'oauth2'::text OR authorization_url IS NOT NULL AND token_url IS NOT NULL AND userinfo_url IS NOT NULL)

- custom_oauth_providers_oidc_discovery_url_https — CHECK (provider_type <> 'oidc'::text OR discovery_url IS NULL OR discovery_url ~~ 'https://%'::text)

- custom_oauth_providers_oidc_issuer_https — CHECK (provider_type <> 'oidc'::text OR issuer IS NULL OR issuer ~~ 'https://%'::text)

- custom_oauth_providers_oidc_requires_issuer — CHECK (provider_type <> 'oidc'::text OR issuer IS NOT NULL)

- custom_oauth_providers_pkey — PRIMARY KEY (id)

- custom_oauth_providers_provider_type_check — CHECK (provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))

- custom_oauth_providers_token_url_https — CHECK (token_url IS NULL OR token_url ~~ 'https://%'::text)

- custom_oauth_providers_token_url_length — CHECK (token_url IS NULL OR char_length(token_url) <= 2048)

- custom_oauth_providers_userinfo_url_https — CHECK (userinfo_url IS NULL OR userinfo_url ~~ 'https://%'::text)

- custom_oauth_providers_userinfo_url_length — CHECK (userinfo_url IS NULL OR char_length(userinfo_url) <= 2048)

- 인덱스 custom_oauth_providers_created_at_idx — CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at)

- 인덱스 custom_oauth_providers_enabled_idx — CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled)

- 인덱스 custom_oauth_providers_identifier_idx — CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier)

- 인덱스 custom_oauth_providers_identifier_key — CREATE UNIQUE INDEX custom_oauth_providers_identifier_key ON auth.custom_oauth_providers USING btree (identifier)

- 인덱스 custom_oauth_providers_pkey — CREATE UNIQUE INDEX custom_oauth_providers_pkey ON auth.custom_oauth_providers USING btree (id)

- 인덱스 custom_oauth_providers_provider_type_idx — CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type)

### auth.flow_state · 인증 흐름 상태

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| user_id | 사용자 식별자 | uuid | 예 |  |  |
| auth_code |  | text | 예 |  |  |
| code_challenge_method |  | auth.code_challenge_method | 예 |  |  |
| code_challenge |  | text | 예 |  |  |
| provider_type |  | text | 아니오 |  |  |
| provider_access_token |  | text | 예 |  |  |
| provider_refresh_token |  | text | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 예 |  |  |
| updated_at | 수정 시각 | timestamp with time zone | 예 |  |  |
| authentication_method |  | text | 아니오 |  |  |
| auth_code_issued_at |  | timestamp with time zone | 예 |  |  |
| invite_token |  | text | 예 |  |  |
| referrer |  | text | 예 |  |  |
| oauth_client_state_id |  | uuid | 예 |  |  |
| linking_target_id |  | uuid | 예 |  |  |
| email_optional |  | boolean | 아니오 | false |  |

- flow_state_pkey — PRIMARY KEY (id)

- 인덱스 flow_state_created_at_idx — CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC)

- 인덱스 flow_state_pkey — CREATE UNIQUE INDEX flow_state_pkey ON auth.flow_state USING btree (id)

- 인덱스 idx_auth_code — CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code)

- 인덱스 idx_user_id_auth_method — CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method)

### auth.identities · 인증 식별 정보

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| provider_id |  | text | 아니오 |  | UNIQUE |
| user_id | 사용자 식별자 | uuid | 아니오 |  | FK |
| identity_data |  | jsonb | 아니오 |  |  |
| provider |  | text | 아니오 |  | UNIQUE |
| last_sign_in_at |  | timestamp with time zone | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 예 |  |  |
| updated_at | 수정 시각 | timestamp with time zone | 예 |  |  |
| email | Auth: Email is a generated column that references the optional email property in the identity_data / Auth: Email is a generated column that references the optional email property in the identity_data | text | 예 | lower((identity_data ->> 'email'::text)) |  |
| id | 식별자 | uuid | 아니오 | gen_random_uuid() | PK |

- identities_pkey — PRIMARY KEY (id)

- identities_provider_id_provider_unique — UNIQUE (provider_id, provider)

- identities_user_id_fkey — FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

- 인덱스 identities_email_idx — CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops)

- 인덱스 identities_pkey — CREATE UNIQUE INDEX identities_pkey ON auth.identities USING btree (id)

- 인덱스 identities_provider_id_provider_unique — CREATE UNIQUE INDEX identities_provider_id_provider_unique ON auth.identities USING btree (provider_id, provider)

- 인덱스 identities_user_id_idx — CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id)

### auth.instances · 인증 인스턴스

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| uuid |  | uuid | 예 |  |  |
| raw_base_config |  | text | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 예 |  |  |
| updated_at | 수정 시각 | timestamp with time zone | 예 |  |  |

- instances_pkey — PRIMARY KEY (id)

- 인덱스 instances_pkey — CREATE UNIQUE INDEX instances_pkey ON auth.instances USING btree (id)

### auth.mfa_amr_claims · 다중 인증 방식 클레임

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| session_id |  | uuid | 아니오 |  | UNIQUE, FK |
| created_at | 생성 시각 | timestamp with time zone | 아니오 |  |  |
| updated_at | 수정 시각 | timestamp with time zone | 아니오 |  |  |
| authentication_method |  | text | 아니오 |  | UNIQUE |
| id | 식별자 | uuid | 아니오 |  | PK |

- amr_id_pk — PRIMARY KEY (id)

- mfa_amr_claims_session_id_authentication_method_pkey — UNIQUE (session_id, authentication_method)

- mfa_amr_claims_session_id_fkey — FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE

- 인덱스 amr_id_pk — CREATE UNIQUE INDEX amr_id_pk ON auth.mfa_amr_claims USING btree (id)

- 인덱스 mfa_amr_claims_session_id_authentication_method_pkey — CREATE UNIQUE INDEX mfa_amr_claims_session_id_authentication_method_pkey ON auth.mfa_amr_claims USING btree (session_id, authentication_method)

### auth.mfa_challenges · 다중 인증 검증 요청

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| factor_id |  | uuid | 아니오 |  | FK |
| created_at | 생성 시각 | timestamp with time zone | 아니오 |  |  |
| verified_at |  | timestamp with time zone | 예 |  |  |
| ip_address |  | inet | 아니오 |  |  |
| otp_code |  | text | 예 |  |  |
| web_authn_session_data |  | jsonb | 예 |  |  |

- mfa_challenges_auth_factor_id_fkey — FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE

- mfa_challenges_pkey — PRIMARY KEY (id)

- 인덱스 mfa_challenge_created_at_idx — CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC)

- 인덱스 mfa_challenges_pkey — CREATE UNIQUE INDEX mfa_challenges_pkey ON auth.mfa_challenges USING btree (id)

### auth.mfa_factors · 다중 인증 수단

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| user_id | 사용자 식별자 | uuid | 아니오 |  | FK |
| friendly_name |  | text | 예 |  |  |
| factor_type |  | auth.factor_type | 아니오 |  |  |
| status |  | auth.factor_status | 아니오 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 아니오 |  |  |
| updated_at | 수정 시각 | timestamp with time zone | 아니오 |  |  |
| secret |  | text | 예 |  |  |
| phone |  | text | 예 |  |  |
| last_challenged_at |  | timestamp with time zone | 예 |  | UNIQUE |
| web_authn_credential |  | jsonb | 예 |  |  |
| web_authn_aaguid |  | uuid | 예 |  |  |
| last_webauthn_challenge_data | Stores the latest WebAuthn challenge data including attestation/assertion for customer verification / Stores the latest WebAuthn challenge data including attestation/assertion for customer verification | jsonb | 예 |  |  |

- mfa_factors_last_challenged_at_key — UNIQUE (last_challenged_at)

- mfa_factors_pkey — PRIMARY KEY (id)

- mfa_factors_user_id_fkey — FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

- 인덱스 factor_id_created_at_idx — CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at)

- 인덱스 mfa_factors_last_challenged_at_key — CREATE UNIQUE INDEX mfa_factors_last_challenged_at_key ON auth.mfa_factors USING btree (last_challenged_at)

- 인덱스 mfa_factors_pkey — CREATE UNIQUE INDEX mfa_factors_pkey ON auth.mfa_factors USING btree (id)

- 인덱스 mfa_factors_user_friendly_name_unique — CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text)

- 인덱스 mfa_factors_user_id_idx — CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id)

- 인덱스 unique_phone_factor_per_user — CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone)

### auth.mfa_recovery_code_sets · 다중 인증 복구 코드 묶음

종류 테이블 · RLS 미사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| user_id | 사용자 식별자 | uuid | 아니오 |  | FK, UNIQUE |
| mfa_factor_id |  | uuid | 아니오 |  | FK, UNIQUE |
| failed_verification_count |  | integer | 아니오 | 0 |  |
| verification_locked_until |  | timestamp with time zone | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 아니오 | now() |  |
| updated_at | 수정 시각 | timestamp with time zone | 아니오 | now() |  |

- mfa_recovery_code_sets_failed_verification_count_check — CHECK (failed_verification_count >= 0)

- mfa_recovery_code_sets_mfa_factor_id_fkey — FOREIGN KEY (mfa_factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE

- mfa_recovery_code_sets_mfa_factor_id_key — UNIQUE (mfa_factor_id)

- mfa_recovery_code_sets_pkey — PRIMARY KEY (id)

- mfa_recovery_code_sets_user_id_fkey — FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

- mfa_recovery_code_sets_user_id_key — UNIQUE (user_id)

- 인덱스 mfa_recovery_code_sets_mfa_factor_id_key — CREATE UNIQUE INDEX mfa_recovery_code_sets_mfa_factor_id_key ON auth.mfa_recovery_code_sets USING btree (mfa_factor_id)

- 인덱스 mfa_recovery_code_sets_pkey — CREATE UNIQUE INDEX mfa_recovery_code_sets_pkey ON auth.mfa_recovery_code_sets USING btree (id)

- 인덱스 mfa_recovery_code_sets_user_id_key — CREATE UNIQUE INDEX mfa_recovery_code_sets_user_id_key ON auth.mfa_recovery_code_sets USING btree (user_id)

### auth.mfa_recovery_codes · 다중 인증 복구 코드

종류 테이블 · RLS 미사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| mfa_recovery_code_set_id |  | uuid | 아니오 |  | FK |
| code_hash |  | text | 아니오 |  |  |
| consumed_at |  | timestamp with time zone | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 아니오 | now() |  |

- mfa_recovery_codes_mfa_recovery_code_set_id_fkey — FOREIGN KEY (mfa_recovery_code_set_id) REFERENCES auth.mfa_recovery_code_sets(id) ON DELETE CASCADE

- mfa_recovery_codes_pkey — PRIMARY KEY (id)

- 인덱스 mfa_recovery_codes_pkey — CREATE UNIQUE INDEX mfa_recovery_codes_pkey ON auth.mfa_recovery_codes USING btree (id)

- 인덱스 mfa_recovery_codes_set_id_idx — CREATE INDEX mfa_recovery_codes_set_id_idx ON auth.mfa_recovery_codes USING btree (mfa_recovery_code_set_id)

### auth.oauth_authorizations · OAuth 인가

종류 테이블 · RLS 미사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| authorization_id |  | text | 아니오 |  | UNIQUE |
| client_id |  | uuid | 아니오 |  | FK |
| user_id | 사용자 식별자 | uuid | 예 |  | FK |
| redirect_uri |  | text | 아니오 |  |  |
| scope |  | text | 아니오 |  |  |
| state |  | text | 예 |  |  |
| resource |  | text | 예 |  |  |
| code_challenge |  | text | 예 |  |  |
| code_challenge_method |  | auth.code_challenge_method | 예 |  |  |
| response_type |  | auth.oauth_response_type | 아니오 | 'code'::auth.oauth_response_type |  |
| status |  | auth.oauth_authorization_status | 아니오 | 'pending'::auth.oauth_authorization_status |  |
| authorization_code |  | text | 예 |  | UNIQUE |
| created_at | 생성 시각 | timestamp with time zone | 아니오 | now() |  |
| expires_at |  | timestamp with time zone | 아니오 | (now() + '00:03:00'::interval) |  |
| approved_at |  | timestamp with time zone | 예 |  |  |
| nonce |  | text | 예 |  |  |

- oauth_authorizations_authorization_code_key — UNIQUE (authorization_code)

- oauth_authorizations_authorization_code_length — CHECK (char_length(authorization_code) <= 255)

- oauth_authorizations_authorization_id_key — UNIQUE (authorization_id)

- oauth_authorizations_client_id_fkey — FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE

- oauth_authorizations_code_challenge_length — CHECK (char_length(code_challenge) <= 128)

- oauth_authorizations_expires_at_future — CHECK (expires_at > created_at)

- oauth_authorizations_nonce_length — CHECK (char_length(nonce) <= 255)

- oauth_authorizations_pkey — PRIMARY KEY (id)

- oauth_authorizations_redirect_uri_length — CHECK (char_length(redirect_uri) <= 2048)

- oauth_authorizations_resource_length — CHECK (char_length(resource) <= 2048)

- oauth_authorizations_scope_length — CHECK (char_length(scope) <= 4096)

- oauth_authorizations_state_length — CHECK (char_length(state) <= 4096)

- oauth_authorizations_user_id_fkey — FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

- 인덱스 oauth_auth_pending_exp_idx — CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status)

- 인덱스 oauth_authorizations_authorization_code_key — CREATE UNIQUE INDEX oauth_authorizations_authorization_code_key ON auth.oauth_authorizations USING btree (authorization_code)

- 인덱스 oauth_authorizations_authorization_id_key — CREATE UNIQUE INDEX oauth_authorizations_authorization_id_key ON auth.oauth_authorizations USING btree (authorization_id)

- 인덱스 oauth_authorizations_pkey — CREATE UNIQUE INDEX oauth_authorizations_pkey ON auth.oauth_authorizations USING btree (id)

### auth.oauth_client_states · OAuth 클라이언트 상태

종류 테이블 · RLS 미사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| provider_type |  | text | 아니오 |  |  |
| code_verifier |  | text | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 아니오 |  |  |

- oauth_client_states_pkey — PRIMARY KEY (id)

- 인덱스 idx_oauth_client_states_created_at — CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at)

- 인덱스 oauth_client_states_pkey — CREATE UNIQUE INDEX oauth_client_states_pkey ON auth.oauth_client_states USING btree (id)

### auth.oauth_clients · OAuth 클라이언트

종류 테이블 · RLS 미사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| client_secret_hash |  | text | 예 |  |  |
| registration_type |  | auth.oauth_registration_type | 아니오 |  |  |
| redirect_uris |  | text | 아니오 |  |  |
| grant_types |  | text | 아니오 |  |  |
| client_name |  | text | 예 |  |  |
| client_uri |  | text | 예 |  |  |
| logo_uri |  | text | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 아니오 | now() |  |
| updated_at | 수정 시각 | timestamp with time zone | 아니오 | now() |  |
| deleted_at | 삭제 시각 | timestamp with time zone | 예 |  |  |
| client_type |  | auth.oauth_client_type | 아니오 | 'confidential'::auth.oauth_client_type |  |
| token_endpoint_auth_method |  | text | 아니오 |  |  |

- oauth_clients_client_name_length — CHECK (char_length(client_name) <= 1024)

- oauth_clients_client_uri_length — CHECK (char_length(client_uri) <= 2048)

- oauth_clients_logo_uri_length — CHECK (char_length(logo_uri) <= 2048)

- oauth_clients_pkey — PRIMARY KEY (id)

- oauth_clients_token_endpoint_auth_method_check — CHECK (token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text]))

- 인덱스 oauth_clients_deleted_at_idx — CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at)

- 인덱스 oauth_clients_pkey — CREATE UNIQUE INDEX oauth_clients_pkey ON auth.oauth_clients USING btree (id)

### auth.oauth_consents · OAuth 동의

종류 테이블 · RLS 미사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| user_id | 사용자 식별자 | uuid | 아니오 |  | UNIQUE, FK |
| client_id |  | uuid | 아니오 |  | FK, UNIQUE |
| scopes |  | text | 아니오 |  |  |
| granted_at |  | timestamp with time zone | 아니오 | now() |  |
| revoked_at |  | timestamp with time zone | 예 |  |  |

- oauth_consents_client_id_fkey — FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE

- oauth_consents_pkey — PRIMARY KEY (id)

- oauth_consents_revoked_after_granted — CHECK (revoked_at IS NULL OR revoked_at >= granted_at)

- oauth_consents_scopes_length — CHECK (char_length(scopes) <= 2048)

- oauth_consents_scopes_not_empty — CHECK (char_length(TRIM(BOTH FROM scopes)) > 0)

- oauth_consents_user_client_unique — UNIQUE (user_id, client_id)

- oauth_consents_user_id_fkey — FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

- 인덱스 oauth_consents_active_client_idx — CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL)

- 인덱스 oauth_consents_active_user_client_idx — CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL)

- 인덱스 oauth_consents_pkey — CREATE UNIQUE INDEX oauth_consents_pkey ON auth.oauth_consents USING btree (id)

- 인덱스 oauth_consents_user_client_unique — CREATE UNIQUE INDEX oauth_consents_user_client_unique ON auth.oauth_consents USING btree (user_id, client_id)

- 인덱스 oauth_consents_user_order_idx — CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC)

### auth.one_time_tokens · 일회용 토큰

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| user_id | 사용자 식별자 | uuid | 아니오 |  | FK |
| token_type |  | auth.one_time_token_type | 아니오 |  |  |
| token_hash |  | text | 아니오 |  |  |
| relates_to |  | text | 아니오 |  |  |
| created_at | 생성 시각 | timestamp without time zone | 아니오 | now() |  |
| updated_at | 수정 시각 | timestamp without time zone | 아니오 | now() |  |
| expires_at |  | timestamp with time zone | 예 |  |  |

- one_time_tokens_pkey — PRIMARY KEY (id)

- one_time_tokens_token_hash_check — CHECK (char_length(token_hash) > 0)

- one_time_tokens_user_id_fkey — FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

- 인덱스 one_time_tokens_pkey — CREATE UNIQUE INDEX one_time_tokens_pkey ON auth.one_time_tokens USING btree (id)

- 인덱스 one_time_tokens_relates_to_hash_idx — CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to)

- 인덱스 one_time_tokens_token_hash_hash_idx — CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash)

- 인덱스 one_time_tokens_user_id_token_type_key — CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type)

### auth.refresh_tokens · 갱신 토큰

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| instance_id |  | uuid | 예 |  |  |
| id | 식별자 | bigint | 아니오 | nextval('auth.refresh_tokens_id_seq'::regclass) | PK |
| token |  | character varying(255) | 예 |  | UNIQUE |
| user_id | 사용자 식별자 | character varying(255) | 예 |  |  |
| revoked |  | boolean | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 예 |  |  |
| updated_at | 수정 시각 | timestamp with time zone | 예 |  |  |
| parent |  | character varying(255) | 예 |  |  |
| session_id |  | uuid | 예 |  | FK |

- refresh_tokens_pkey — PRIMARY KEY (id)

- refresh_tokens_session_id_fkey — FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE

- refresh_tokens_token_unique — UNIQUE (token)

- 인덱스 refresh_tokens_instance_id_idx — CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id)

- 인덱스 refresh_tokens_instance_id_user_id_idx — CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id)

- 인덱스 refresh_tokens_parent_idx — CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent)

- 인덱스 refresh_tokens_pkey — CREATE UNIQUE INDEX refresh_tokens_pkey ON auth.refresh_tokens USING btree (id)

- 인덱스 refresh_tokens_session_id_revoked_idx — CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked)

- 인덱스 refresh_tokens_token_unique — CREATE UNIQUE INDEX refresh_tokens_token_unique ON auth.refresh_tokens USING btree (token)

- 인덱스 refresh_tokens_updated_at_idx — CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC)

### auth.saml_providers · SAML 공급자

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| sso_provider_id |  | uuid | 아니오 |  | FK |
| entity_id |  | text | 아니오 |  | UNIQUE |
| metadata_xml |  | text | 아니오 |  |  |
| metadata_url |  | text | 예 |  |  |
| attribute_mapping |  | jsonb | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 예 |  |  |
| updated_at | 수정 시각 | timestamp with time zone | 예 |  |  |
| name_id_format |  | text | 예 |  |  |

- entity_id not empty — CHECK (char_length(entity_id) > 0)

- metadata_url not empty — CHECK (metadata_url = NULL::text OR char_length(metadata_url) > 0)

- metadata_xml not empty — CHECK (char_length(metadata_xml) > 0)

- saml_providers_entity_id_key — UNIQUE (entity_id)

- saml_providers_pkey — PRIMARY KEY (id)

- saml_providers_sso_provider_id_fkey — FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE

- 인덱스 saml_providers_entity_id_key — CREATE UNIQUE INDEX saml_providers_entity_id_key ON auth.saml_providers USING btree (entity_id)

- 인덱스 saml_providers_pkey — CREATE UNIQUE INDEX saml_providers_pkey ON auth.saml_providers USING btree (id)

- 인덱스 saml_providers_sso_provider_id_idx — CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id)

### auth.saml_relay_states · SAML 중계 상태

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| sso_provider_id |  | uuid | 아니오 |  | FK |
| request_id |  | text | 아니오 |  |  |
| for_email |  | text | 예 |  |  |
| redirect_to |  | text | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 예 |  |  |
| updated_at | 수정 시각 | timestamp with time zone | 예 |  |  |
| flow_state_id |  | uuid | 예 |  | FK |

- request_id not empty — CHECK (char_length(request_id) > 0)

- saml_relay_states_flow_state_id_fkey — FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE

- saml_relay_states_pkey — PRIMARY KEY (id)

- saml_relay_states_sso_provider_id_fkey — FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE

- 인덱스 saml_relay_states_created_at_idx — CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC)

- 인덱스 saml_relay_states_for_email_idx — CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email)

- 인덱스 saml_relay_states_pkey — CREATE UNIQUE INDEX saml_relay_states_pkey ON auth.saml_relay_states USING btree (id)

- 인덱스 saml_relay_states_sso_provider_id_idx — CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id)

### auth.schema_migrations · 스키마 마이그레이션

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| version | 버전 | character varying(255) | 아니오 |  | PK |

- schema_migrations_pkey — PRIMARY KEY (version)

- 인덱스 schema_migrations_pkey — CREATE UNIQUE INDEX schema_migrations_pkey ON auth.schema_migrations USING btree (version)

### auth.scim_tokens · SCIM 토큰

종류 테이블 · RLS 미사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| sso_provider_id |  | uuid | 아니오 |  | FK |
| token_hash |  | text | 아니오 |  |  |
| prefix |  | text | 아니오 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 아니오 | now() |  |
| expires_at |  | timestamp with time zone | 예 |  |  |
| revoked_at |  | timestamp with time zone | 예 |  |  |
| last_used_at |  | timestamp with time zone | 예 |  |  |

- scim_tokens_expires_at_future — CHECK (expires_at IS NULL OR expires_at > created_at)

- scim_tokens_pkey — PRIMARY KEY (id)

- scim_tokens_revoked_after_created — CHECK (revoked_at IS NULL OR revoked_at >= created_at)

- scim_tokens_sso_provider_id_fkey — FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE

- scim_tokens_token_hash_check — CHECK (token_hash ~ '^[0-9a-f]{64}$'::text)

- 인덱스 scim_tokens_expires_at_idx — CREATE INDEX scim_tokens_expires_at_idx ON auth.scim_tokens USING btree (expires_at)

- 인덱스 scim_tokens_pkey — CREATE UNIQUE INDEX scim_tokens_pkey ON auth.scim_tokens USING btree (id)

- 인덱스 scim_tokens_revoked_at_idx — CREATE INDEX scim_tokens_revoked_at_idx ON auth.scim_tokens USING btree (revoked_at)

- 인덱스 scim_tokens_sso_provider_id_idx — CREATE INDEX scim_tokens_sso_provider_id_idx ON auth.scim_tokens USING btree (sso_provider_id)

- 인덱스 scim_tokens_token_hash_key — CREATE UNIQUE INDEX scim_tokens_token_hash_key ON auth.scim_tokens USING btree (token_hash)

### auth.scim_users · SCIM 사용자

종류 테이블 · RLS 미사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| sso_provider_id |  | uuid | 아니오 |  | FK |
| user_id | 사용자 식별자 | uuid | 예 |  | FK |
| resource |  | jsonb | 아니오 |  |  |
| user_name |  | text | 아니오 | lower((resource ->> 'userName'::text)) |  |
| external_id |  | text | 예 | (resource ->> 'externalId'::text) |  |
| active |  | boolean | 아니오 | COALESCE(((resource ->> 'active'::text))::boolean, true) |  |
| created_at | 생성 시각 | timestamp with time zone | 아니오 | now() |  |
| updated_at | 수정 시각 | timestamp with time zone | 아니오 | now() |  |
| deleted_at | 삭제 시각 | timestamp with time zone | 예 |  |  |

- scim_users_pkey — PRIMARY KEY (id)

- scim_users_sso_provider_id_fkey — FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE

- scim_users_user_id_fkey — FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL

- 인덱스 scim_users_created_at_idx — CREATE INDEX scim_users_created_at_idx ON auth.scim_users USING btree (sso_provider_id, created_at, id) WHERE (deleted_at IS NULL)

- 인덱스 scim_users_deleted_at_idx — CREATE INDEX scim_users_deleted_at_idx ON auth.scim_users USING btree (deleted_at)

- 인덱스 scim_users_external_id_key — CREATE UNIQUE INDEX scim_users_external_id_key ON auth.scim_users USING btree (sso_provider_id, external_id) WHERE ((external_id IS NOT NULL) AND (deleted_at IS NULL))

- 인덱스 scim_users_id_idx — CREATE INDEX scim_users_id_idx ON auth.scim_users USING btree (sso_provider_id, id) WHERE (deleted_at IS NULL)

- 인덱스 scim_users_pkey — CREATE UNIQUE INDEX scim_users_pkey ON auth.scim_users USING btree (id)

- 인덱스 scim_users_sso_provider_id_idx — CREATE INDEX scim_users_sso_provider_id_idx ON auth.scim_users USING btree (sso_provider_id)

- 인덱스 scim_users_updated_at_idx — CREATE INDEX scim_users_updated_at_idx ON auth.scim_users USING btree (sso_provider_id, updated_at, id) WHERE (deleted_at IS NULL)

- 인덱스 scim_users_user_id_idx — CREATE INDEX scim_users_user_id_idx ON auth.scim_users USING btree (user_id)

- 인덱스 scim_users_user_name_idx — CREATE INDEX scim_users_user_name_idx ON auth.scim_users USING btree (sso_provider_id, user_name COLLATE "C", id) WHERE (deleted_at IS NULL)

- 인덱스 scim_users_user_name_key — CREATE UNIQUE INDEX scim_users_user_name_key ON auth.scim_users USING btree (sso_provider_id, user_name) WHERE (deleted_at IS NULL)

### auth.sessions · 인증 세션

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| user_id | 사용자 식별자 | uuid | 아니오 |  | FK |
| created_at | 생성 시각 | timestamp with time zone | 예 |  |  |
| updated_at | 수정 시각 | timestamp with time zone | 예 |  |  |
| factor_id |  | uuid | 예 |  |  |
| aal |  | auth.aal_level | 예 |  |  |
| not_after | Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired. / Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired. | timestamp with time zone | 예 |  |  |
| refreshed_at |  | timestamp without time zone | 예 |  |  |
| user_agent |  | text | 예 |  |  |
| ip |  | inet | 예 |  |  |
| tag |  | text | 예 |  |  |
| oauth_client_id |  | uuid | 예 |  | FK |
| refresh_token_hmac_key | Holds a HMAC-SHA256 key used to sign refresh tokens for this session. / Holds a HMAC-SHA256 key used to sign refresh tokens for this session. | text | 예 |  |  |
| refresh_token_counter | Holds the ID (counter) of the last issued refresh token. / Holds the ID (counter) of the last issued refresh token. | bigint | 예 |  |  |
| scopes |  | text | 예 |  |  |

- sessions_oauth_client_id_fkey — FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE

- sessions_pkey — PRIMARY KEY (id)

- sessions_scopes_length — CHECK (char_length(scopes) <= 4096)

- sessions_user_id_fkey — FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

- 인덱스 sessions_not_after_idx — CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC)

- 인덱스 sessions_oauth_client_id_idx — CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id)

- 인덱스 sessions_pkey — CREATE UNIQUE INDEX sessions_pkey ON auth.sessions USING btree (id)

- 인덱스 sessions_user_id_idx — CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id)

- 인덱스 user_id_created_at_idx — CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at)

### auth.sso_domains · SSO 도메인

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| sso_provider_id |  | uuid | 아니오 |  | FK |
| domain |  | text | 아니오 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 예 |  |  |
| updated_at | 수정 시각 | timestamp with time zone | 예 |  |  |

- domain not empty — CHECK (char_length(domain) > 0)

- sso_domains_pkey — PRIMARY KEY (id)

- sso_domains_sso_provider_id_fkey — FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE

- 인덱스 sso_domains_domain_idx — CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain))

- 인덱스 sso_domains_pkey — CREATE UNIQUE INDEX sso_domains_pkey ON auth.sso_domains USING btree (id)

- 인덱스 sso_domains_sso_provider_id_idx — CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id)

### auth.sso_providers · SSO 공급자

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 |  | PK |
| resource_id | Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code. / Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code. | text | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 예 |  |  |
| updated_at | 수정 시각 | timestamp with time zone | 예 |  |  |
| disabled |  | boolean | 예 |  |  |

- resource_id not empty — CHECK (resource_id = NULL::text OR char_length(resource_id) > 0)

- sso_providers_pkey — PRIMARY KEY (id)

- 인덱스 sso_providers_pkey — CREATE UNIQUE INDEX sso_providers_pkey ON auth.sso_providers USING btree (id)

- 인덱스 sso_providers_resource_id_idx — CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id))

- 인덱스 sso_providers_resource_id_pattern_idx — CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops)

### auth.users · 사용자

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| instance_id |  | uuid | 예 |  |  |
| id | 식별자 | uuid | 아니오 |  | PK |
| aud |  | character varying(255) | 예 |  |  |
| role |  | character varying(255) | 예 |  |  |
| email |  | character varying(255) | 예 |  |  |
| encrypted_password |  | character varying(255) | 예 |  |  |
| email_confirmed_at |  | timestamp with time zone | 예 |  |  |
| invited_at |  | timestamp with time zone | 예 |  |  |
| confirmation_token |  | character varying(255) | 예 |  |  |
| confirmation_sent_at |  | timestamp with time zone | 예 |  |  |
| recovery_token |  | character varying(255) | 예 |  |  |
| recovery_sent_at |  | timestamp with time zone | 예 |  |  |
| email_change_token_new |  | character varying(255) | 예 |  |  |
| email_change |  | character varying(255) | 예 |  |  |
| email_change_sent_at |  | timestamp with time zone | 예 |  |  |
| last_sign_in_at |  | timestamp with time zone | 예 |  |  |
| raw_app_meta_data |  | jsonb | 예 |  |  |
| raw_user_meta_data |  | jsonb | 예 |  |  |
| is_super_admin |  | boolean | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 예 |  |  |
| updated_at | 수정 시각 | timestamp with time zone | 예 |  |  |
| phone |  | text | 예 | NULL::character varying | UNIQUE |
| phone_confirmed_at |  | timestamp with time zone | 예 |  |  |
| phone_change |  | text | 예 | ''::character varying |  |
| phone_change_token |  | character varying(255) | 예 | ''::character varying |  |
| phone_change_sent_at |  | timestamp with time zone | 예 |  |  |
| confirmed_at |  | timestamp with time zone | 예 | LEAST(email_confirmed_at, phone_confirmed_at) |  |
| email_change_token_current |  | character varying(255) | 예 | ''::character varying |  |
| email_change_confirm_status |  | smallint | 예 | 0 |  |
| banned_until |  | timestamp with time zone | 예 |  |  |
| reauthentication_token |  | character varying(255) | 예 | ''::character varying |  |
| reauthentication_sent_at |  | timestamp with time zone | 예 |  |  |
| is_sso_user | Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails. / Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails. | boolean | 아니오 | false |  |
| deleted_at | 삭제 시각 | timestamp with time zone | 예 |  |  |
| is_anonymous |  | boolean | 아니오 | false |  |

- users_email_change_confirm_status_check — CHECK (email_change_confirm_status >= 0 AND email_change_confirm_status <= 2)

- users_phone_key — UNIQUE (phone)

- users_pkey — PRIMARY KEY (id)

- 인덱스 confirmation_token_idx — CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text)

- 인덱스 email_change_token_current_idx — CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text)

- 인덱스 email_change_token_new_idx — CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text)

- 인덱스 idx_users_created_at_desc — CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC)

- 인덱스 idx_users_email — CREATE INDEX idx_users_email ON auth.users USING btree (email)

- 인덱스 idx_users_last_sign_in_at_desc — CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC)

- 인덱스 idx_users_name — CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL)

- 인덱스 reauthentication_token_idx — CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text)

- 인덱스 recovery_token_idx — CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text)

- 인덱스 users_email_partial_key — CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false)

- 인덱스 users_instance_id_email_idx — CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text))

- 인덱스 users_instance_id_idx — CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id)

- 인덱스 users_is_anonymous_idx — CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous)

- 인덱스 users_phone_key — CREATE UNIQUE INDEX users_phone_key ON auth.users USING btree (phone)

- 인덱스 users_pkey — CREATE UNIQUE INDEX users_pkey ON auth.users USING btree (id)

### auth.webauthn_challenges · WebAuthn 검증 요청

종류 테이블 · RLS 미사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 | gen_random_uuid() | PK |
| user_id | 사용자 식별자 | uuid | 예 |  | FK |
| challenge_type |  | text | 아니오 |  |  |
| session_data |  | jsonb | 아니오 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 아니오 | now() |  |
| expires_at |  | timestamp with time zone | 아니오 |  |  |

- webauthn_challenges_challenge_type_check — CHECK (challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text]))

- webauthn_challenges_pkey — PRIMARY KEY (id)

- webauthn_challenges_user_id_fkey — FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

- 인덱스 webauthn_challenges_expires_at_idx — CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at)

- 인덱스 webauthn_challenges_pkey — CREATE UNIQUE INDEX webauthn_challenges_pkey ON auth.webauthn_challenges USING btree (id)

- 인덱스 webauthn_challenges_user_id_idx — CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id)

### auth.webauthn_credentials · WebAuthn 자격 정보

종류 테이블 · RLS 미사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 | gen_random_uuid() | PK |
| user_id | 사용자 식별자 | uuid | 아니오 |  | FK |
| credential_id |  | bytea | 아니오 |  |  |
| public_key |  | bytea | 아니오 |  |  |
| attestation_type |  | text | 아니오 | ''::text |  |
| aaguid |  | uuid | 예 |  |  |
| sign_count |  | bigint | 아니오 | 0 |  |
| transports |  | jsonb | 아니오 | '[]'::jsonb |  |
| backup_eligible |  | boolean | 아니오 | false |  |
| backed_up |  | boolean | 아니오 | false |  |
| friendly_name |  | text | 아니오 | ''::text |  |
| created_at | 생성 시각 | timestamp with time zone | 아니오 | now() |  |
| updated_at | 수정 시각 | timestamp with time zone | 아니오 | now() |  |
| last_used_at |  | timestamp with time zone | 예 |  |  |

- webauthn_credentials_pkey — PRIMARY KEY (id)

- webauthn_credentials_user_id_fkey — FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

- 인덱스 webauthn_credentials_credential_id_key — CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id)

- 인덱스 webauthn_credentials_pkey — CREATE UNIQUE INDEX webauthn_credentials_pkey ON auth.webauthn_credentials USING btree (id)

- 인덱스 webauthn_credentials_user_id_idx — CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id)

### edumaker.board_posts · 게시판 글

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | bigint | 아니오 | IDENTITY | PK |
| title | 제목 | text | 아니오 |  |  |
| content | 내용 | text | 아니오 |  |  |
| published | 공개 여부 | boolean | 아니오 | false |  |
| author_id | 작성자 식별자 | uuid | 아니오 | auth.uid() | FK |
| created_at | 생성 시각 | timestamp with time zone | 아니오 | now() |  |
| updated_at | 수정 시각 | timestamp with time zone | 아니오 | now() |  |
| board_type | 게시판 구분 | text | 아니오 | 'notice'::text | FK |
| updated_by | 수정자 식별자 | uuid | 예 |  | FK |
| code_group | 코드 그룹 | text | 예 | 'BOARD'::text | FK |

- board_posts_author_id_fkey — FOREIGN KEY (author_id) REFERENCES auth.users(id)

- board_posts_board_type_check — CHECK ((board_type ~ '^[a-z][a-z0-9_]{0,39}$'::text))

- board_posts_content_check — CHECK (((char_length(TRIM(BOTH FROM content)) >= 1) AND (char_length(TRIM(BOTH FROM content)) <= 20000)))

- board_posts_pkey — PRIMARY KEY (id)

- board_posts_title_check — CHECK (((char_length(TRIM(BOTH FROM title)) >= 1) AND (char_length(TRIM(BOTH FROM title)) <= 200)))

- board_posts_updated_by_fkey — FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL

- tbl_board_comcode_fk — FOREIGN KEY (code_group, board_type) REFERENCES tbl_comcode(code_group, code)

- 인덱스 board_posts_author_idx — CREATE INDEX board_posts_author_idx ON edumaker.board_posts USING btree (author_id)

- 인덱스 board_posts_pkey — CREATE UNIQUE INDEX board_posts_pkey ON edumaker.board_posts USING btree (id)

- 인덱스 board_posts_type_created_idx — CREATE INDEX board_posts_type_created_idx ON edumaker.board_posts USING btree (board_type, created_at DESC, id DESC)

- 인덱스 board_posts_type_published_idx — CREATE INDEX board_posts_type_published_idx ON edumaker.board_posts USING btree (board_type, created_at DESC, id DESC) WHERE published

- 인덱스 board_posts_updater_idx — CREATE INDEX board_posts_updater_idx ON edumaker.board_posts USING btree (updated_by) WHERE (updated_by IS NOT NULL)

### edumaker.canva_connections · Canva 연결

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| owner | 소유자 | text | 아니오 |  | PK |
| tokens | 연결 토큰 | text | 아니오 |  |  |
| updated | 수정 시각 | text | 아니오 |  |  |

- canva_connections_pkey — PRIMARY KEY (owner)

- 인덱스 canva_connections_pkey — CREATE UNIQUE INDEX canva_connections_pkey ON edumaker.canva_connections USING btree (owner)

### edumaker.canva_jobs · Canva 작업

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| owner | 소유자 | text | 아니오 |  | PK |
| id | 식별자 | text | 아니오 |  | PK |
| course_id | 강좌 식별자 | text | 아니오 |  |  |
| created | 생성 시각 | text | 아니오 |  |  |

- canva_jobs_pkey — PRIMARY KEY (owner, id)

- 인덱스 canva_jobs_pkey — CREATE UNIQUE INDEX canva_jobs_pkey ON edumaker.canva_jobs USING btree (owner, id)

### edumaker.canva_link_categories · Canva 링크 분류

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| owner | 소유자 | text | 아니오 |  | UNIQUE, PK |
| id | 식별자 | text | 아니오 |  | PK |
| title | 제목 | text | 아니오 |  | UNIQUE |

- canva_link_categories_owner_title_key — UNIQUE (owner, title)

- canva_link_categories_pkey — PRIMARY KEY (owner, id)

- 인덱스 canva_link_categories_owner_title_key — CREATE UNIQUE INDEX canva_link_categories_owner_title_key ON edumaker.canva_link_categories USING btree (owner, title)

- 인덱스 canva_link_categories_pkey — CREATE UNIQUE INDEX canva_link_categories_pkey ON edumaker.canva_link_categories USING btree (owner, id)

### edumaker.canva_links · Canva 링크

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| owner | 소유자 | text | 아니오 |  | FK, PK |
| id | 식별자 | text | 아니오 |  | PK |
| category_id | 분류 식별자 | text | 예 |  | FK |
| title | 제목 | text | 아니오 |  |  |
| date | 날짜 | text | 아니오 |  |  |
| url | 주소 | text | 아니오 |  |  |
| created | 생성 시각 | text | 아니오 |  |  |

- canva_links_owner_category_id_fkey — FOREIGN KEY (owner, category_id) REFERENCES edumaker.canva_link_categories(owner, id) ON DELETE SET NULL (category_id)

- canva_links_pkey — PRIMARY KEY (owner, id)

- 인덱스 canva_links_by_category — CREATE INDEX canva_links_by_category ON edumaker.canva_links USING btree (owner, category_id)

- 인덱스 canva_links_by_date — CREATE INDEX canva_links_by_date ON edumaker.canva_links USING btree (owner, date DESC, created DESC, id)

- 인덱스 canva_links_pkey — CREATE UNIQUE INDEX canva_links_pkey ON edumaker.canva_links USING btree (owner, id)

### edumaker.category_images · 분류 이미지

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| owner | 소유자 | text | 아니오 |  | FK, PK |
| category_id | 분류 식별자 | text | 아니오 |  | FK, PK |
| slot | 이미지 위치 | integer | 아니오 |  | PK |
| mime | 파일 형식 | text | 아니오 |  |  |
| data | 데이터 | bytea | 아니오 |  |  |
| caption | 이미지 설명 | text | 아니오 |  |  |
| updated | 수정 시각 | text | 아니오 |  |  |

- category_images_data_check — CHECK (((octet_length(data) >= 1) AND (octet_length(data) <= 524288)))

- category_images_mime_check — CHECK ((mime = ANY (ARRAY['image/jpeg'::text, 'image/png'::text, 'image/webp'::text])))

- category_images_owner_category_id_fkey — FOREIGN KEY (owner, category_id) REFERENCES edumaker.journal_categories(owner, id) ON DELETE CASCADE

- category_images_pkey — PRIMARY KEY (owner, category_id, slot)

- category_images_slot_check — CHECK ((slot = ANY (ARRAY[1, 2])))

- 인덱스 category_images_pkey — CREATE UNIQUE INDEX category_images_pkey ON edumaker.category_images USING btree (owner, category_id, slot)

### edumaker.courses · 강좌

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| owner | 소유자 | text | 아니오 |  | FK, PK |
| id | 식별자 | text | 아니오 |  | PK |
| topic | 주제 | text | 아니오 |  |  |
| audience | 수업 대상 | text | 아니오 |  |  |
| planned_date | 예정일 | text | 아니오 |  |  |
| input_options | 입력 옵션 | jsonb | 아니오 |  |  |
| metadata | 메타데이터 | jsonb | 아니오 |  |  |
| category_id | 분류 식별자 | text | 예 |  | FK |
| journal_defaults | 일지 기본값 | jsonb | 예 |  |  |
| updated | 수정 시각 | text | 아니오 |  |  |
| version | 버전 | uuid | 아니오 | gen_random_uuid() |  |

- courses_owner_category_id_fkey — FOREIGN KEY (owner, category_id) REFERENCES edumaker.journal_categories(owner, id) ON DELETE SET NULL (category_id)

- courses_pkey — PRIMARY KEY (owner, id)

- 인덱스 courses_owner_category — CREATE INDEX courses_owner_category ON edumaker.courses USING btree (owner, category_id)

- 인덱스 courses_owner_updated — CREATE INDEX courses_owner_updated ON edumaker.courses USING btree (owner, updated DESC, id)

- 인덱스 courses_pkey — CREATE UNIQUE INDEX courses_pkey ON edumaker.courses USING btree (owner, id)

### edumaker.journal_categories · 수업 일지 분류

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| owner | 소유자 | text | 아니오 |  | PK |
| id | 식별자 | text | 아니오 |  | PK |
| title | 제목 | text | 아니오 |  |  |
| start_date | 시작일 | text | 아니오 |  |  |
| end_date | 종료일 | text | 아니오 |  |  |
| guidance | 작성 안내 | text | 아니오 |  |  |
| goal_count | 목표 수 | integer | 아니오 |  |  |
| topic_count | 주제 수 | integer | 아니오 |  |  |
| detail_count | 세부 항목 수 | integer | 아니오 |  |  |
| updated | 수정 시각 | text | 아니오 |  |  |

- journal_categories_detail_count_check — CHECK (((detail_count >= 1) AND (detail_count <= 8)))

- journal_categories_goal_count_check — CHECK (((goal_count >= 1) AND (goal_count <= 8)))

- journal_categories_pkey — PRIMARY KEY (owner, id)

- journal_categories_topic_count_check — CHECK (((topic_count >= 1) AND (topic_count <= 10)))

- 인덱스 journal_categories_pkey — CREATE UNIQUE INDEX journal_categories_pkey ON edumaker.journal_categories USING btree (owner, id)

### edumaker.journals · 수업 일지

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| owner | 소유자 | text | 아니오 |  | FK, PK |
| course_id | 강좌 식별자 | text | 아니오 |  | FK, PK |
| session_position | 차시 순서 | integer | 아니오 |  | FK, PK |
| body | 본문 | text | 아니오 |  |  |
| class_date | 수업일 | text | 아니오 |  |  |
| activities | 활동 | text | 아니오 |  |  |
| actual_details | 실제 수업 세부 내용 | jsonb | 아니오 |  |  |
| outline | 개요 | jsonb | 아니오 |  |  |
| created_at | 생성 시각 | text | 예 |  |  |
| deleted_at | 삭제 시각 | text | 예 |  |  |

- journals_owner_course_id_session_position_fkey — FOREIGN KEY (owner, course_id, session_position) REFERENCES edumaker.sessions(owner, course_id, "position") ON DELETE CASCADE

- journals_pkey — PRIMARY KEY (owner, course_id, session_position)

- 인덱스 journals_pkey — CREATE UNIQUE INDEX journals_pkey ON edumaker.journals USING btree (owner, course_id, session_position)

### edumaker.news_articles · 뉴스 기사

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| owner | 소유자 | text | 아니오 |  | FK, PK |
| course_id | 강좌 식별자 | text | 아니오 |  | FK, PK |
| position | 순서 | integer | 아니오 |  | PK |
| article | 기사 | jsonb | 아니오 |  |  |

- news_articles_owner_course_id_fkey — FOREIGN KEY (owner, course_id) REFERENCES edumaker.courses(owner, id) ON DELETE CASCADE

- news_articles_pkey — PRIMARY KEY (owner, course_id, "position")

- news_articles_position_check — CHECK (("position" >= 0))

- 인덱스 news_articles_pkey — CREATE UNIQUE INDEX news_articles_pkey ON edumaker.news_articles USING btree (owner, course_id, "position")

### edumaker.sessions · 차시

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| owner | 소유자 | text | 아니오 |  | FK, PK |
| course_id | 강좌 식별자 | text | 아니오 |  | FK, PK |
| position | 순서 | integer | 아니오 |  | PK |
| title | 제목 | text | 아니오 |  |  |
| plan | 수업 계획 | jsonb | 아니오 |  |  |

- sessions_owner_course_id_fkey — FOREIGN KEY (owner, course_id) REFERENCES edumaker.courses(owner, id) ON DELETE CASCADE

- sessions_pkey — PRIMARY KEY (owner, course_id, "position")

- sessions_position_check — CHECK (("position" >= 0))

- 인덱스 sessions_pkey — CREATE UNIQUE INDEX sessions_pkey ON edumaker.sessions USING btree (owner, course_id, "position")

### edumaker.slide_sources · 슬라이드 출처

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| owner | 소유자 | text | 아니오 |  | FK, PK |
| course_id | 강좌 식별자 | text | 아니오 |  | FK, PK |
| slide_position | 슬라이드 순서 | integer | 아니오 |  | FK, PK |
| position | 순서 | integer | 아니오 |  | PK |
| article | 기사 | jsonb | 아니오 |  |  |

- slide_sources_owner_course_id_slide_position_fkey — FOREIGN KEY (owner, course_id, slide_position) REFERENCES edumaker.slides(owner, course_id, "position") ON DELETE CASCADE

- slide_sources_pkey — PRIMARY KEY (owner, course_id, slide_position, "position")

- slide_sources_position_check — CHECK (("position" >= 0))

- 인덱스 slide_sources_pkey — CREATE UNIQUE INDEX slide_sources_pkey ON edumaker.slide_sources USING btree (owner, course_id, slide_position, "position")

### edumaker.slides · 슬라이드

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| owner | 소유자 | text | 아니오 |  | FK, PK |
| course_id | 강좌 식별자 | text | 아니오 |  | FK, PK |
| position | 순서 | integer | 아니오 |  | PK |
| session_number | 차시 번호 | integer | 아니오 |  |  |
| kind | 종류 | text | 아니오 |  |  |
| title | 제목 | text | 아니오 |  |  |
| body | 본문 | text | 아니오 |  |  |
| notes | 발표 노트 | text | 아니오 |  |  |
| extra | 추가 정보 | jsonb | 아니오 |  |  |

- slides_owner_course_id_fkey — FOREIGN KEY (owner, course_id) REFERENCES edumaker.courses(owner, id) ON DELETE CASCADE

- slides_pkey — PRIMARY KEY (owner, course_id, "position")

- slides_position_check — CHECK (("position" >= 0))

- 인덱스 slides_by_session — CREATE INDEX slides_by_session ON edumaker.slides USING btree (owner, course_id, session_number) WHERE (kind = 'lesson'::text)

- 인덱스 slides_pkey — CREATE UNIQUE INDEX slides_pkey ON edumaker.slides USING btree (owner, course_id, "position")

### edumaker.storage_credentials · 저장소 자격 정보

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| key_hash | 접근 키 해시 | bytea | 아니오 |  | PK |

- storage_credentials_key_hash_check — CHECK ((octet_length(key_hash) = 32))

- storage_credentials_pkey — PRIMARY KEY (key_hash)

- 인덱스 storage_credentials_pkey — CREATE UNIQUE INDEX storage_credentials_pkey ON edumaker.storage_credentials USING btree (key_hash)

### extensions.pg_stat_statements · SQL 실행 통계

종류 뷰 · RLS 뷰 원본의 정책과 보안 옵션 확인

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| userid |  | oid | 예 |  |  |
| dbid |  | oid | 예 |  |  |
| toplevel |  | boolean | 예 |  |  |
| queryid |  | bigint | 예 |  |  |
| query |  | text | 예 |  |  |
| plans |  | bigint | 예 |  |  |
| total_plan_time |  | double precision | 예 |  |  |
| min_plan_time |  | double precision | 예 |  |  |
| max_plan_time |  | double precision | 예 |  |  |
| mean_plan_time |  | double precision | 예 |  |  |
| stddev_plan_time |  | double precision | 예 |  |  |
| calls |  | bigint | 예 |  |  |
| total_exec_time |  | double precision | 예 |  |  |
| min_exec_time |  | double precision | 예 |  |  |
| max_exec_time |  | double precision | 예 |  |  |
| mean_exec_time |  | double precision | 예 |  |  |
| stddev_exec_time |  | double precision | 예 |  |  |
| rows |  | bigint | 예 |  |  |
| shared_blks_hit |  | bigint | 예 |  |  |
| shared_blks_read |  | bigint | 예 |  |  |
| shared_blks_dirtied |  | bigint | 예 |  |  |
| shared_blks_written |  | bigint | 예 |  |  |
| local_blks_hit |  | bigint | 예 |  |  |
| local_blks_read |  | bigint | 예 |  |  |
| local_blks_dirtied |  | bigint | 예 |  |  |
| local_blks_written |  | bigint | 예 |  |  |
| temp_blks_read |  | bigint | 예 |  |  |
| temp_blks_written |  | bigint | 예 |  |  |
| shared_blk_read_time |  | double precision | 예 |  |  |
| shared_blk_write_time |  | double precision | 예 |  |  |
| local_blk_read_time |  | double precision | 예 |  |  |
| local_blk_write_time |  | double precision | 예 |  |  |
| temp_blk_read_time |  | double precision | 예 |  |  |
| temp_blk_write_time |  | double precision | 예 |  |  |
| wal_records |  | bigint | 예 |  |  |
| wal_fpi |  | bigint | 예 |  |  |
| wal_bytes |  | numeric | 예 |  |  |
| jit_functions |  | bigint | 예 |  |  |
| jit_generation_time |  | double precision | 예 |  |  |
| jit_inlining_count |  | bigint | 예 |  |  |
| jit_inlining_time |  | double precision | 예 |  |  |
| jit_optimization_count |  | bigint | 예 |  |  |
| jit_optimization_time |  | double precision | 예 |  |  |
| jit_emission_count |  | bigint | 예 |  |  |
| jit_emission_time |  | double precision | 예 |  |  |
| jit_deform_count |  | bigint | 예 |  |  |
| jit_deform_time |  | double precision | 예 |  |  |
| stats_since |  | timestamp with time zone | 예 |  |  |
| minmax_stats_since |  | timestamp with time zone | 예 |  |  |

### extensions.pg_stat_statements_info · SQL 통계 수집 정보

종류 뷰 · RLS 뷰 원본의 정책과 보안 옵션 확인

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| dealloc |  | bigint | 예 |  |  |
| stats_reset |  | timestamp with time zone | 예 |  |  |

### public.tbl_board · 게시판 글

종류 뷰 · RLS 뷰 원본의 정책과 보안 옵션 확인

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | bigint | 예 |  |  |
| board_type | 게시판 구분 | text | 예 |  |  |
| title | 제목 | text | 예 |  |  |
| content | 내용 | text | 예 |  |  |
| published | 공개 여부 | boolean | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 예 |  |  |
| updated_at | 수정 시각 | timestamp with time zone | 예 |  |  |

### public.tbl_comcode · 공통코드

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| code | 코드 | text | 아니오 |  | UNIQUE, PK |
| code_group | 코드 그룹 | text | 아니오 |  | UNIQUE |
| name | 이름 | text | 아니오 |  |  |
| public_read | 공개 조회 여부 | boolean | 아니오 | false |  |

- tbl_comcode_check — CHECK (((NOT public_read) OR (code_group = 'BOARD'::text)))

- tbl_comcode_code_group_check — CHECK ((code_group = ANY (ARRAY['DEPT'::text, 'BOARD'::text])))

- tbl_comcode_code_group_code_key — UNIQUE (code_group, code)

- tbl_comcode_name_check — CHECK ((length(TRIM(BOTH FROM name)) > 0))

- tbl_comcode_pkey — PRIMARY KEY (code)

- 인덱스 tbl_comcode_code_group_code_key — CREATE UNIQUE INDEX tbl_comcode_code_group_code_key ON public.tbl_comcode USING btree (code_group, code)

- 인덱스 tbl_comcode_pkey — CREATE UNIQUE INDEX tbl_comcode_pkey ON public.tbl_comcode USING btree (code)

### public.tbl_dept · 부서

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| code | 코드 | text | 아니오 |  | PK, FK |
| sort_order | 표시 순서 | integer | 아니오 |  |  |
| code_group | 코드 그룹 | text | 예 | 'DEPT'::text | FK |

- staff_departments_pkey — PRIMARY KEY (code)

- tbl_dept_comcode_fk — FOREIGN KEY (code_group, code) REFERENCES tbl_comcode(code_group, code)

- 인덱스 staff_departments_pkey — CREATE UNIQUE INDEX staff_departments_pkey ON public.tbl_dept USING btree (code)

### public.tbl_emp · 사원

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| department_code | 부서코드 | text | 아니오 |  | FK |
| emp_code | 사원코드 | text | 아니오 |  | PK |
| name | 이름 | text | 아니오 |  |  |
| rank |  | integer | 아니오 |  |  |
| sort_order | 표시 순서 | integer | 아니오 |  |  |
| profile |  | jsonb | 아니오 |  |  |

- staff_members_department_code_fkey — FOREIGN KEY (department_code) REFERENCES tbl_dept(code)

- staff_members_profile_check — CHECK ((jsonb_typeof(profile) = 'object'::text))

- staff_members_rank_check — CHECK (((rank >= '-1'::integer) AND (rank <= 2)))

- tbl_emp_pkey — PRIMARY KEY (emp_code)

- 인덱스 staff_members_department_idx — CREATE INDEX staff_members_department_idx ON public.tbl_emp USING btree (department_code)

- 인덱스 tbl_emp_pkey — CREATE UNIQUE INDEX tbl_emp_pkey ON public.tbl_emp USING btree (emp_code)

### public.tbl_evalu · 업무 평가

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 | gen_random_uuid() | PK |
| member_id | 평가 대상 사원코드 | text | 아니오 |  | UNIQUE, FK |
| assessment | 평가 내용 | text | 아니오 |  |  |
| rating | 별점 | smallint | 예 |  |  |
| evaluated_at | 평가 일시 | timestamp with time zone | 아니오 | now() |  |
| details |  | jsonb | 아니오 | '{}'::jsonb |  |
| import_key | 이관 중복 방지 키 | text | 예 |  | UNIQUE |

- staff_evaluations_assessment_check — CHECK ((length(TRIM(BOTH FROM assessment)) > 0))

- staff_evaluations_member_id_import_key_key — UNIQUE (member_id, import_key)

- staff_evaluations_pkey — PRIMARY KEY (id)

- staff_evaluations_rating_check — CHECK (((rating >= 0) AND (rating <= 5)))

- tbl_evalu_emp_code_fkey — FOREIGN KEY (member_id) REFERENCES tbl_emp(emp_code)

- 인덱스 staff_evaluations_member_date_idx — CREATE INDEX staff_evaluations_member_date_idx ON public.tbl_evalu USING btree (member_id, evaluated_at DESC)

- 인덱스 staff_evaluations_member_id_import_key_key — CREATE UNIQUE INDEX staff_evaluations_member_id_import_key_key ON public.tbl_evalu USING btree (member_id, import_key)

- 인덱스 staff_evaluations_pkey — CREATE UNIQUE INDEX staff_evaluations_pkey ON public.tbl_evalu USING btree (id)

### public.tbl_users · 관리자 계정

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| user_id | 사용자 식별자 | uuid | 아니오 |  | PK, FK |
| created_at | 생성 시각 | timestamp with time zone | 아니오 | now() |  |

- admin_users_pkey — PRIMARY KEY (user_id)

- admin_users_user_id_fkey — FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

- 인덱스 admin_users_pkey — CREATE UNIQUE INDEX admin_users_pkey ON public.tbl_users USING btree (user_id)

### realtime.messages · 실시간 메시지

종류 파티션 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| topic | 주제 | text | 아니오 |  |  |
| extension |  | text | 아니오 |  |  |
| payload |  | jsonb | 예 |  |  |
| event |  | text | 예 |  |  |
| private |  | boolean | 예 | false |  |
| updated_at | 수정 시각 | timestamp without time zone | 아니오 | timezone('utc'::text, clock_timestamp()) |  |
| inserted_at |  | timestamp without time zone | 아니오 | timezone('utc'::text, clock_timestamp()) | PK |
| id | 식별자 | uuid | 아니오 | gen_random_uuid() | PK |
| binary_payload |  | bytea | 예 |  |  |
| skip_broadcast |  | boolean | 아니오 | false |  |
| expires_at |  | timestamp without time zone | 예 |  |  |

- messages_payload_exclusive — CHECK (payload IS NULL OR binary_payload IS NULL) NOT VALID

- messages_pkey — PRIMARY KEY (id, inserted_at)

- 인덱스 messages_pkey — CREATE UNIQUE INDEX messages_pkey ON ONLY realtime.messages USING btree (id, inserted_at)

- 인덱스 messages_replay_index — CREATE INDEX messages_replay_index ON ONLY realtime.messages USING btree (topic, inserted_at DESC, COALESCE(expires_at, 'infinity'::timestamp without time zone)) WHERE ((extension = 'broadcast'::text) AND (private = true))

### realtime.schema_migrations · 스키마 마이그레이션

종류 테이블 · RLS 미사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| version | 버전 | bigint | 아니오 |  | PK |
| inserted_at |  | timestamp(0) without time zone | 예 | now() |  |

- schema_migrations_pkey — PRIMARY KEY (version)

- 인덱스 schema_migrations_pkey — CREATE UNIQUE INDEX schema_migrations_pkey ON realtime.schema_migrations USING btree (version)

### realtime.subscription · 실시간 구독

종류 테이블 · RLS 미사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | bigint | 아니오 | IDENTITY | PK |
| subscription_id |  | uuid | 아니오 |  |  |
| entity |  | regclass | 아니오 |  |  |
| filters |  | realtime.user_defined_filter[] | 아니오 | '{}'::realtime.user_defined_filter[] |  |
| claims |  | jsonb | 아니오 |  |  |
| claims_role |  | regrole | 아니오 | realtime.to_regrole((claims ->> 'role'::text)) |  |
| created_at | 생성 시각 | timestamp without time zone | 아니오 | timezone('utc'::text, now()) |  |
| action_filter |  | text | 예 | '*'::text |  |
| selected_columns |  | text[] | 예 |  |  |

- pk_subscription — PRIMARY KEY (id)

- subscription_action_filter_check — CHECK (action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text]))

- 인덱스 ix_realtime_subscription_entity — CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity)

- 인덱스 pk_subscription — CREATE UNIQUE INDEX pk_subscription ON realtime.subscription USING btree (id)

- 인덱스 subscription_subscription_id_entity_filters_hash_key — CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_hash_key ON realtime.subscription USING btree (subscription_id, entity, realtime.filters_hash(filters), action_filter, COALESCE(selected_columns, '{}'::text[]))

### storage.bucket_lifecycle_states · 버킷 수명 주기 상태

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| bucket_id |  | text | 아니오 |  | FK, PK |
| generation |  | uuid | 예 |  |  |
| next_run_at |  | timestamp with time zone | 예 |  |  |
| claim_id |  | uuid | 예 |  |  |
| claim_until |  | timestamp with time zone | 예 |  |  |
| continuation |  | jsonb | 예 |  |  |
| last_started_at |  | timestamp with time zone | 예 |  |  |
| last_completed_at |  | timestamp with time zone | 예 |  |  |
| last_success_at |  | timestamp with time zone | 예 |  |  |
| last_result |  | jsonb | 예 |  |  |
| failure_count |  | integer | 아니오 | 0 |  |
| last_error |  | jsonb | 예 |  |  |
| updated_at | 수정 시각 | timestamp with time zone | 아니오 | now() |  |

- bucket_lifecycle_continuation_object_check — CHECK (continuation IS NULL OR jsonb_typeof(continuation) = 'object'::text)

- bucket_lifecycle_failure_count_check — CHECK (failure_count >= 0)

- bucket_lifecycle_last_result_object_check — CHECK (last_result IS NULL OR jsonb_typeof(last_result) = 'object'::text)

- bucket_lifecycle_recovery_due_check — CHECK (next_run_at IS NOT NULL OR NOT jsonb_path_exists(COALESCE(continuation, '{}'::jsonb), '$."batch"."inFlight"'::jsonpath))

- bucket_lifecycle_states_bucket_id_fkey — FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id) ON DELETE CASCADE

- bucket_lifecycle_states_pkey — PRIMARY KEY (bucket_id)

- 인덱스 bucket_lifecycle_states_due_idx — CREATE INDEX bucket_lifecycle_states_due_idx ON storage.bucket_lifecycle_states USING btree (next_run_at, bucket_id) WHERE (next_run_at IS NOT NULL)

- 인덱스 bucket_lifecycle_states_pkey — CREATE UNIQUE INDEX bucket_lifecycle_states_pkey ON storage.bucket_lifecycle_states USING btree (bucket_id)

### storage.buckets · 파일 버킷

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | text | 아니오 |  | PK |
| name | 이름 | text | 아니오 |  |  |
| owner | 소유자 / Field is deprecated, use owner_id instead | uuid | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 예 | now() |  |
| updated_at | 수정 시각 | timestamp with time zone | 예 | now() |  |
| public |  | boolean | 예 | false |  |
| avif_autodetection |  | boolean | 예 | false |  |
| file_size_limit |  | bigint | 예 |  |  |
| allowed_mime_types |  | text[] | 예 |  |  |
| owner_id |  | text | 예 |  |  |
| type |  | storage.buckettype | 아니오 | 'STANDARD'::storage.buckettype |  |
| versioning_status |  | text | 아니오 | 'DISABLED'::text |  |
| lifecycle_configuration |  | jsonb | 예 |  |  |
| lifecycle_configuration_generation |  | uuid | 예 |  |  |

- buckets_lifecycle_configuration_pair_check — CHECK ((lifecycle_configuration IS NULL) = (lifecycle_configuration_generation IS NULL))

- buckets_lifecycle_configuration_shape_check — CHECK (lifecycle_configuration IS NULL OR jsonb_typeof(lifecycle_configuration) = 'object'::text AND lifecycle_configuration ? 'rules'::text AND CASE     WHEN jsonb_typeof(lifecycle_configuration -> 'rules'::text) = 'array'::text THEN jsonb_array_length(lifecycle_configuration -> 'rules'::text) >= 1 AND jsonb_array_length(lifecycle_configuration -> 'rules'::text) <= 1000     ELSE false END)

- buckets_lifecycle_configuration_standard_only_check — CHECK (type = 'STANDARD'::storage.buckettype OR lifecycle_configuration IS NULL AND lifecycle_configuration_generation IS NULL)

- buckets_pkey — PRIMARY KEY (id)

- buckets_versioning_standard_only_check — CHECK (type = 'STANDARD'::storage.buckettype OR versioning_status = 'DISABLED'::text)

- buckets_versioning_status_check — CHECK (versioning_status = ANY (ARRAY['DISABLED'::text, 'ENABLED'::text, 'SUSPENDED'::text]))

- 인덱스 bname — CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name)

- 인덱스 buckets_pkey — CREATE UNIQUE INDEX buckets_pkey ON storage.buckets USING btree (id)

### storage.buckets_analytics · 분석 버킷

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| name | 이름 | text | 아니오 |  |  |
| type |  | storage.buckettype | 아니오 | 'ANALYTICS'::storage.buckettype |  |
| format |  | text | 아니오 | 'ICEBERG'::text |  |
| created_at | 생성 시각 | timestamp with time zone | 아니오 | now() |  |
| updated_at | 수정 시각 | timestamp with time zone | 아니오 | now() |  |
| id | 식별자 | uuid | 아니오 | gen_random_uuid() | PK |
| deleted_at | 삭제 시각 | timestamp with time zone | 예 |  |  |

- buckets_analytics_pkey — PRIMARY KEY (id)

- 인덱스 buckets_analytics_pkey — CREATE UNIQUE INDEX buckets_analytics_pkey ON storage.buckets_analytics USING btree (id)

- 인덱스 buckets_analytics_unique_name_idx — CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL)

### storage.buckets_vectors · 벡터 버킷

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | text | 아니오 |  | PK |
| type |  | storage.buckettype | 아니오 | 'VECTOR'::storage.buckettype |  |
| created_at | 생성 시각 | timestamp with time zone | 아니오 | now() |  |
| updated_at | 수정 시각 | timestamp with time zone | 아니오 | now() |  |

- buckets_vectors_pkey — PRIMARY KEY (id)

- 인덱스 buckets_vectors_pkey — CREATE UNIQUE INDEX buckets_vectors_pkey ON storage.buckets_vectors USING btree (id)

### storage.lifecycle_abandoned_artifacts · 수명 주기 미완료 자료

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| bucket_id |  | text | 아니오 |  | PK |
| key |  | text | 아니오 |  | PK |
| name | 이름 | text | 아니오 |  |  |
| version | 버전 | text | 예 |  |  |
| attempted_at |  | timestamp with time zone | 아니오 | now() |  |

- lifecycle_abandoned_artifacts_pkey — PRIMARY KEY (bucket_id, key)

- 인덱스 lifecycle_abandoned_artifacts_attempted_at_idx — CREATE INDEX lifecycle_abandoned_artifacts_attempted_at_idx ON storage.lifecycle_abandoned_artifacts USING btree (attempted_at)

- 인덱스 lifecycle_abandoned_artifacts_pkey — CREATE UNIQUE INDEX lifecycle_abandoned_artifacts_pkey ON storage.lifecycle_abandoned_artifacts USING btree (bucket_id, key)

### storage.migrations · 마이그레이션

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | integer | 아니오 |  | PK |
| name | 이름 | character varying(100) | 아니오 |  | UNIQUE |
| hash |  | character varying(40) | 아니오 |  |  |
| executed_at |  | timestamp without time zone | 예 | CURRENT_TIMESTAMP |  |

- migrations_name_key — UNIQUE (name)

- migrations_pkey — PRIMARY KEY (id)

- 인덱스 migrations_name_key — CREATE UNIQUE INDEX migrations_name_key ON storage.migrations USING btree (name)

- 인덱스 migrations_pkey — CREATE UNIQUE INDEX migrations_pkey ON storage.migrations USING btree (id)

### storage.objects · 저장 파일

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 | gen_random_uuid() | PK |
| bucket_id |  | text | 예 |  | FK |
| name | 이름 | text | 예 |  |  |
| owner | 소유자 / Field is deprecated, use owner_id instead | uuid | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 예 | now() |  |
| updated_at | 수정 시각 | timestamp with time zone | 예 | now() |  |
| last_accessed_at |  | timestamp with time zone | 예 | now() |  |
| metadata | 메타데이터 | jsonb | 예 |  |  |
| path_tokens |  | text[] | 예 | string_to_array(name, '/'::text) |  |
| version | 버전 | text | 예 |  |  |
| owner_id |  | text | 예 |  |  |
| user_metadata |  | jsonb | 예 |  |  |
| archived_at |  | timestamp with time zone | 예 |  |  |
| is_delete_marker |  | boolean | 아니오 | false |  |
| is_versioned |  | boolean | 아니오 | false |  |

- objects_bucketId_fkey — FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id)

- objects_pkey — PRIMARY KEY (id)

- 인덱스 idx_objects_bucket_id_name — CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C")

- 인덱스 idx_objects_bucket_id_name_lower — CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C")

- 인덱스 idx_objects_current_version — CREATE UNIQUE INDEX idx_objects_current_version ON storage.objects USING btree (bucket_id, name COLLATE "C") WHERE (archived_at IS NULL)

- 인덱스 idx_objects_delete_markers — CREATE INDEX idx_objects_delete_markers ON storage.objects USING btree (bucket_id, name COLLATE "C") WHERE is_delete_marker

- 인덱스 idx_objects_null_version — CREATE UNIQUE INDEX idx_objects_null_version ON storage.objects USING btree (bucket_id, name COLLATE "C") WHERE (NOT is_versioned)

- 인덱스 name_prefix_search — CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops)

- 인덱스 objects_archived_due_idx — CREATE INDEX objects_archived_due_idx ON storage.objects USING btree (bucket_id, archived_at, name COLLATE "C") INCLUDE (id, version, is_delete_marker) WHERE (archived_at IS NOT NULL)

- 인덱스 objects_archived_order_uq — CREATE UNIQUE INDEX objects_archived_order_uq ON storage.objects USING btree (bucket_id, name COLLATE "C", archived_at) WHERE (archived_at IS NOT NULL)

- 인덱스 objects_bucket_id_name_version_key — CREATE UNIQUE INDEX objects_bucket_id_name_version_key ON storage.objects USING btree (bucket_id, name COLLATE "C", version) NULLS NOT DISTINCT

- 인덱스 objects_pkey — CREATE UNIQUE INDEX objects_pkey ON storage.objects USING btree (id)

### storage.s3_multipart_uploads · S3 분할 업로드

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | text | 아니오 |  | PK |
| in_progress_size |  | bigint | 아니오 | 0 |  |
| upload_signature |  | text | 아니오 |  |  |
| bucket_id |  | text | 아니오 |  | FK |
| key |  | text | 아니오 |  |  |
| version | 버전 | text | 아니오 |  |  |
| owner_id |  | text | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 아니오 | now() |  |
| user_metadata |  | jsonb | 예 |  |  |
| metadata | 메타데이터 | jsonb | 예 |  |  |

- s3_multipart_uploads_bucket_id_fkey — FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id)

- s3_multipart_uploads_pkey — PRIMARY KEY (id)

- 인덱스 idx_multipart_uploads_list — CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at)

- 인덱스 s3_multipart_uploads_pkey — CREATE UNIQUE INDEX s3_multipart_uploads_pkey ON storage.s3_multipart_uploads USING btree (id)

### storage.s3_multipart_uploads_parts · S3 분할 업로드 조각

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 | gen_random_uuid() | PK |
| upload_id |  | text | 아니오 |  | FK |
| size |  | bigint | 아니오 | 0 |  |
| part_number |  | integer | 아니오 |  |  |
| bucket_id |  | text | 아니오 |  | FK |
| key |  | text | 아니오 |  |  |
| etag |  | text | 아니오 |  |  |
| owner_id |  | text | 예 |  |  |
| version | 버전 | text | 아니오 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 아니오 | now() |  |

- s3_multipart_uploads_parts_bucket_id_fkey — FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id)

- s3_multipart_uploads_parts_pkey — PRIMARY KEY (id)

- s3_multipart_uploads_parts_upload_id_fkey — FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE

- 인덱스 s3_multipart_uploads_parts_pkey — CREATE UNIQUE INDEX s3_multipart_uploads_parts_pkey ON storage.s3_multipart_uploads_parts USING btree (id)

### storage.vector_indexes · 벡터 인덱스

종류 테이블 · RLS 사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | text | 아니오 | gen_random_uuid() | PK |
| name | 이름 | text | 아니오 |  |  |
| bucket_id |  | text | 아니오 |  | FK |
| data_type |  | text | 아니오 |  |  |
| dimension |  | integer | 아니오 |  |  |
| distance_metric |  | text | 아니오 |  |  |
| metadata_configuration |  | jsonb | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 아니오 | now() |  |
| updated_at | 수정 시각 | timestamp with time zone | 아니오 | now() |  |

- vector_indexes_bucket_id_fkey — FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id)

- vector_indexes_pkey — PRIMARY KEY (id)

- 인덱스 vector_indexes_name_bucket_id_idx — CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id)

- 인덱스 vector_indexes_pkey — CREATE UNIQUE INDEX vector_indexes_pkey ON storage.vector_indexes USING btree (id)

### supabase_migrations.schema_migrations · 스키마 마이그레이션

종류 테이블 · RLS 미사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| version | 버전 | text | 아니오 |  | PK |
| statements |  | text[] | 예 |  |  |
| name | 이름 | text | 예 |  |  |
| created_by |  | text | 예 |  |  |
| idempotency_key |  | text | 예 |  | UNIQUE |
| rollback |  | text[] | 예 |  |  |

- schema_migrations_idempotency_key_key — UNIQUE (idempotency_key)

- schema_migrations_pkey — PRIMARY KEY (version)

- 인덱스 schema_migrations_idempotency_key_key — CREATE UNIQUE INDEX schema_migrations_idempotency_key_key ON supabase_migrations.schema_migrations USING btree (idempotency_key)

- 인덱스 schema_migrations_pkey — CREATE UNIQUE INDEX schema_migrations_pkey ON supabase_migrations.schema_migrations USING btree (version)

### vault.decrypted_secrets · 보안 저장 항목 조회 뷰

종류 뷰 · RLS 뷰 원본의 정책과 보안 옵션 확인

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 예 |  |  |
| name | 이름 | text | 예 |  |  |
| description |  | text | 예 |  |  |
| secret |  | text | 예 |  |  |
| decrypted_secret |  | text | 예 |  |  |
| key_id |  | uuid | 예 |  |  |
| nonce |  | bytea | 예 |  |  |
| created_at | 생성 시각 | timestamp with time zone | 예 |  |  |
| updated_at | 수정 시각 | timestamp with time zone | 예 |  |  |

### vault.secrets · 보안 저장 항목

종류 테이블 · RLS 미사용

| 컬럼 영문명 | 한글 설명·DB 코멘트 | 자료형 | NULL 허용 | 기본값·자동 생성 | 키 |
|---|---|---|---|---|---|
| id | 식별자 | uuid | 아니오 | gen_random_uuid() | PK |
| name | 이름 | text | 예 |  |  |
| description |  | text | 아니오 | ''::text |  |
| secret |  | text | 아니오 |  |  |
| key_id |  | uuid | 예 |  |  |
| nonce |  | bytea | 예 | vault._crypto_aead_det_noncegen() |  |
| created_at | 생성 시각 | timestamp with time zone | 아니오 | CURRENT_TIMESTAMP |  |
| updated_at | 수정 시각 | timestamp with time zone | 아니오 | CURRENT_TIMESTAMP |  |

- secrets_pkey — PRIMARY KEY (id)

- 인덱스 secrets_name_idx — CREATE UNIQUE INDEX secrets_name_idx ON vault.secrets USING btree (name) WHERE (name IS NOT NULL)

- 인덱스 secrets_pkey — CREATE UNIQUE INDEX secrets_pkey ON vault.secrets USING btree (id)

## 애플리케이션 함수와 트리거

| 스키마·함수 | 인자 | 반환형 |
|---|---|---|
| edumaker.canva_link_page | p_owner text, args jsonb | jsonb |
| edumaker.category_doc | c edumaker.journal_categories | jsonb |
| edumaker.course_context | c edumaker.courses | jsonb |
| edumaker.course_doc | c edumaker.courses | jsonb |
| edumaker.dispatch | p_owner text, p_operation text, p_args jsonb | jsonb |
| edumaker.journal_selection | p_owner text, args jsonb | jsonb |
| edumaker.library_page | p_owner text, args jsonb | jsonb |
| edumaker.save_category | p_owner text, args jsonb | jsonb |
| edumaker.save_course | p_owner text, doc jsonb, saved_at text, expected_version uuid | void |
| edumaker.stamp_board_post_update |  | trigger |
| public.edumaker_storage | p_owner text, p_operation text, p_args jsonb | jsonb |

- edumaker.board_posts_stamp_update — CREATE TRIGGER board_posts_stamp_update BEFORE UPDATE OF title, content, published, board_type ON edumaker.board_posts FOR EACH ROW EXECUTE FUNCTION edumaker.stamp_board_post_update()

## 공개 뷰 정의

### public.tbl_board

~~~sql
 SELECT id,
    board_type,
    title,
    content,
    published,
    created_at,
    updated_at
   FROM edumaker.board_posts;
~~~

## RLS 정책

| 테이블 | 정책 | 역할 | 동작 | USING | WITH CHECK |
|---|---|---|---|---|---|
| edumaker.board_posts | admin create announcements | authenticated | INSERT |  | ((author_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1    FROM tbl_users   WHERE (tbl_users.user_id = ( SELECT auth.uid() AS uid))))) |
| edumaker.board_posts | admin delete announcements | authenticated | DELETE | (EXISTS ( SELECT 1    FROM tbl_users   WHERE (tbl_users.user_id = ( SELECT auth.uid() AS uid)))) |  |
| edumaker.board_posts | admin edit announcements | authenticated | UPDATE | (EXISTS ( SELECT 1    FROM tbl_users   WHERE (tbl_users.user_id = ( SELECT auth.uid() AS uid)))) | (EXISTS ( SELECT 1    FROM tbl_users   WHERE (tbl_users.user_id = ( SELECT auth.uid() AS uid)))) |
| edumaker.board_posts | administrators read all notices | authenticated | SELECT | (EXISTS ( SELECT 1    FROM tbl_users   WHERE (tbl_users.user_id = ( SELECT auth.uid() AS uid)))) |  |
| edumaker.board_posts | everyone read published notices | anon, authenticated | SELECT | (published AND (EXISTS ( SELECT 1    FROM tbl_comcode c   WHERE ((c.code_group = 'BOARD'::text) AND (c.code = board_posts.board_type) AND c.public_read)))) |  |
| public.tbl_comcode | admins read common codes | authenticated | SELECT | (EXISTS ( SELECT 1    FROM tbl_users   WHERE (tbl_users.user_id = ( SELECT auth.uid() AS uid)))) |  |
| public.tbl_comcode | read public board codes | anon, authenticated | SELECT | ((code_group = 'BOARD'::text) AND public_read) |  |
| public.tbl_dept | staff_admin_access | authenticated | ALL | (EXISTS ( SELECT 1    FROM tbl_users   WHERE (tbl_users.user_id = ( SELECT auth.uid() AS uid)))) |  |
| public.tbl_emp | staff_admin_access | authenticated | ALL | (EXISTS ( SELECT 1    FROM tbl_users   WHERE (tbl_users.user_id = ( SELECT auth.uid() AS uid)))) |  |
| public.tbl_evalu | staff_admin_access | authenticated | ALL | (EXISTS ( SELECT 1    FROM tbl_users   WHERE (tbl_users.user_id = ( SELECT auth.uid() AS uid)))) |  |
| public.tbl_users | admins see own membership | authenticated | SELECT | (user_id = ( SELECT auth.uid() AS uid)) |  |
