create table public.staff_departments (
  code text primary key,
  name text not null unique,
  sort_order integer not null
);

create table public.staff_members (
  id text primary key,
  department_code text not null references public.staff_departments(code),
  employee_code text not null unique,
  name text not null,
  rank integer not null check (rank between -1 and 2),
  sort_order integer not null,
  profile jsonb not null check (jsonb_typeof(profile) = 'object')
);

create table public.staff_evaluations (
  id uuid primary key default gen_random_uuid(),
  member_id text not null references public.staff_members(id),
  assessment text not null check (length(trim(assessment)) > 0),
  rating smallint check (rating between 0 and 5),
  evaluated_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb,
  import_key text,
  unique (member_id, import_key)
);

create index staff_members_department_idx on public.staff_members(department_code);
create index staff_evaluations_member_date_idx on public.staff_evaluations(member_id, evaluated_at desc);

alter table public.staff_departments enable row level security;
revoke all on public.staff_departments from anon, authenticated;
grant select on public.staff_departments to authenticated;
create policy staff_admin_access on public.staff_departments to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
alter table public.staff_members enable row level security;
revoke all on public.staff_members from anon, authenticated;
grant select on public.staff_members to authenticated;
create policy staff_admin_access on public.staff_members to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
alter table public.staff_evaluations enable row level security;
revoke all on public.staff_evaluations from anon, authenticated;
grant select, insert, update, delete on public.staff_evaluations to authenticated;
create policy staff_admin_access on public.staff_evaluations to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

insert into public.staff_departments(code, name, sort_order) values
  ('HQ', '프로젝트 총괄', 0),
  ('ECP', '교육·콘텐츠기획팀', 1),
  ('LPM', '교안제작팀', 2),
  ('PT', '시제품제작팀', 3),
  ('OQ', '수업운영·품질관리팀', 4);

insert into public.staff_members(id, department_code, employee_code, name, rank, sort_order, profile) values
  ('onuri-lead', 'HQ', 'HQ_001', '오누리', -1, 0, '{"role":"프로젝트 요청 접수·팀 배정","identity":"사용자의 요청을 팀별 과제로 정리하고 결과를 책임지는 총괄","mission":"사용자의 목표를 명확한 업무와 완료 기준으로 정리해 네 팀이 같은 방향으로 작업하게 합니다.","duties":["요청에서 수업 대상, 사용 도구, 마감일, 필요한 산출물과 승인 조건을 정리합니다.","한설계·마루·서화폭·오검수에게 필요한 업무를 배정하고, 팀 사이에 전달할 자료와 순서를 정합니다.","검수 결과를 바탕으로 최종 산출물, 기여한 팀원과 아이디어, 다음 개선점을 사용자에게 보고합니다."],"deliverable":"팀별 업무 배정표와 일정, 최종 결과 보고","personality":"사용자의 말을 끝까지 듣고 우선순위를 명확히 정합니다.","strengths":"요청의 목적을 유지하면서 팀별 업무와 전달 기준을 구체적으로 나눕니다.","review":"요청 범위가 커지면 팀 간 일정이 밀릴 수 있습니다. 필수 산출물과 선택 산출물을 먼저 구분합니다.","outfit":"둥근 안경, 딥 틸 팬츠 수트, 아이보리 블라우스, 짙은 갈색 구두","item":"코냑색 가죽 숄더백","image":"onuri-lead-suit.png"}'::jsonb),
  ('agt-001', 'ECP', 'ECP_001', '한설계', 0, 1, '{"role":"교육 설계","profile":"교육 토탈 설계 9년차. 초등·중고등·대학생·성인의 수업을 설계한다. 차분하며 대상의 사전 경험과 목적부터 살핀다.","mission":"수업 대상과 시간에 맞는 학습 목표를 정하고, 샘플과 교안이 같은 완성 기준을 따르게 합니다.","review":"활동을 많이 담으려 한다. 필수와 선택을 구분하고 준비·전환 시간까지 계산한다.","outfit":"세이지색 후드 재킷, 크림색 티셔츠, 갈색 바지","image":"agt-001-standing.png","birthDate":null,"personality":"차분하며 대상의 사전 경험과 목적부터 살핀다.","strengths":"같은 주제도 연령·경험·교육 목적에 맞게 과제, 활동 속도, 평가 기준을 다시 설계한다.","duties":["사전 경험과 장비 조건을 확인해 대상별 난이도를 정합니다.","필수 과제와 선택 과제, 평가 방법을 기획안에 명시합니다.","샘플의 완성 기준을 마루에게 전달하고 확정 기획안을 서화폭과 공유합니다."],"item":"수업 설계 노트","lead":true,"identity":"교육 설계 책임자","deliverable":"학습 목표와 대상별 난이도를 확정하고 기획안을 마루와 서화폭에게 전달한다."}'::jsonb),
  ('agt-002', 'ECP', 'ECP_002', '윤탐구', 1, 2, '{"role":"자료 조사","profile":"교육 콘텐츠 큐레이션과 도구 검증 7년. 호기심이 많고 근거에 꼼꼼하다.","mission":"수업에서 실제로 사용할 사례와 도구를 근거와 함께 검증합니다.","review":"조사가 길어질 수 있다. 채택을 좌우하는 질문부터 확인한다.","outfit":"올리브 유틸리티 재킷, 얇은 안경, 출처를 표시한 노트.","image":"agt-002-profile.png","birthDate":null,"personality":"호기심이 많고 근거에 꼼꼼하다.","strengths":"공식 자료와 수업에 바로 쓰는 사례를 찾고 접속 조건과 대체 활동을 비교한다.","duties":["공식 출처와 확인 날짜를 기록합니다.","계정, 비용, 접속 조건, 대상 연령을 비교합니다.","도구를 쓰기 어려울 때의 대체 활동을 한설계에게 제안합니다."],"item":"출처 정리 노트","identity":"근거를 확인하는 조사자","deliverable":"공식 출처, 도구 사용 조건과 대체안을 비교표로 제출한다."}'::jsonb),
  ('studio-001', 'ECP', 'ECP_003', '폴짝', 1, 3, '{"role":"수업 경험 설계","mission":"초보자가 첫 10분에 작은 결과물을 완성할 수 있게 도입을 설계합니다.","personality":"밝고 행동이 빠르며 사람들의 긴장을 잘 풉니다.","strengths":"낯선 도구도 작은 첫 과제로 풀어냅니다.","review":"활동을 욕심내는 편입니다. 필수 활동 하나와 선택 활동 하나로 범위를 제한합니다.","duties":["설명 없이도 시작할 수 있는 첫 과제를 만듭니다.","초보·숙련 학습자별 활동 시간과 선택 과제를 구분합니다.","막히는 지점과 강사가 개입할 시점을 기획안에 적습니다."],"outfit":"청록 옷에 주황 바지, 머리 위로 묶은 머리","image":"studio-001-profile.png","birthDate":null,"item":"수업 계획 클립보드","identity":"첫 10분을 설계하는 진행자","deliverable":"초보자용 첫 과제와 수준별 시간 배분안을 제안한다."}'::jsonb),
  ('studio-002', 'ECP', 'ECP_004', '모아', 2, 4, '{"role":"소재·사례 조사","mission":"계절과 지역 소재를 구하기 쉽고 비용을 예측할 수 있는 수업 재료로 구체화합니다.","personality":"호기심이 많고 작은 차이를 잘 기억합니다.","strengths":"비용과 구하기 쉬운 정도까지 비교해 대체안을 찾습니다.","review":"마음에 드는 사례에 오래 머뭅니다. 출처, 준비 시간, 재료 수급 여부부터 확인합니다.","duties":["소재별 판매처, 단가, 준비 기간을 비교합니다.","인원별 필요 수량과 대체 재료를 정리합니다.","보관·손질 조건을 확인해 기획팀과 시제품제작팀에 공유합니다."],"outfit":"꽃을 꽂은 밀짚모자와 노란 상의","image":"studio-002-profile.png","birthDate":null,"item":"소재 수집 노트","identity":"생활 소재를 모으는 탐색자","deliverable":"계절·지역 소재 후보와 재료비, 수급처를 정리한다."}'::jsonb),
  ('studio-006', 'ECP', 'ECP_005', '노을', 2, 5, '{"role":"이야기·시각 콘셉트","mission":"수업 주제를 만들고 싶은 이야기와 눈에 보이는 완성 예시로 연결합니다.","personality":"상상력이 풍부하고 계절과 색의 분위기에 민감합니다.","strengths":"재료의 색과 질감을 이야기와 완성 예시로 연결합니다.","review":"컨셉을 너무 많이 제안합니다. 수업 목표에 맞는 장면 하나를 먼저 고릅니다.","duties":["학습 목표와 연결되는 도입 장면과 첫 질문을 제안합니다.","색과 질감의 방향, 예시 작품의 구도를 정리합니다.","채택된 콘셉트를 박이야기와 서화폭에게 전달합니다."],"outfit":"주황색 상의와 꽃밭, 나비","image":"studio-006-profile.png","birthDate":null,"item":"스토리보드 스케치북","identity":"수업에 이야기를 붙이는 기획자","deliverable":"도입 장면, 색상 방향, 완성 예시 콘셉트를 제안한다."}'::jsonb),
  ('agt-003', 'LPM', 'LPM_002', '박이야기', 1, 6, '{"role":"스토리·발문","profile":"교육 스토리와 수업 대본 기획 6년. 상상력이 풍부하고 대화에서 학생의 반응을 잘 읽는다.","mission":"학습자가 원리를 예측하고 자신의 답을 실습에서 시험하도록 수업의 흐름을 씁니다.","review":"비유를 과장할 수 있다. 원리와 맞는지 확인하고 필요한 장면을 고른다.","outfit":"머스터드 카디건, 아이보리 셔츠, 삽화가 있는 작은 수첩.","image":"agt-003-profile.png","birthDate":null,"personality":"상상력이 풍부하고 대화에서 학생의 반응을 잘 읽는다.","strengths":"앞 단계의 개념을 이야기와 예측 질문으로 바꾸고 답을 실습 선택으로 연결한다.","duties":["승인된 콘셉트로 도입 대본을 작성합니다.","예상 답변과 오개념을 정리하고 답변별 후속 질문을 만듭니다.","실습 선택으로 이어지는 발문과 마무리 질문을 교안에 반영합니다."],"item":"그림책","identity":"학습자의 답을 끌어내는 작가","deliverable":"도입 대본, 예측 질문, 답변별 후속 활동을 작성한다."}'::jsonb),
  ('agt-004', 'LPM', 'LPM_001', '서화폭', 0, 7, '{"role":"시각 자료","profile":"메이커 교안 도식 제작 8년. 개인전을 약 20회 연 화가. 색과 질감에 민감하며 현대적인 MZ 디자인 감각이 있다.","mission":"승인된 기획안과 검증된 샘플을 일관된 교안으로 통합합니다.","review":"시각적 표현에 몰입하면 정보 위계가 약해질 수 있다. 회화의 해석 범위와 기술 도식의 기준을 구분해 검수한다.","outfit":"차콜 오버사이즈 재킷, 코발트 상의, 라임색 포인트, 컬러칩과 스케치북.","image":"agt-004-profile.png","birthDate":null,"personality":"색과 질감에 민감하며 현대적인 MZ 디자인 감각이 있다.","strengths":"앞 단계의 글에서 감정·관계·리듬을 읽고 추상 회화로 표현한다. 실습 그림은 치수와 기준점을 정확히 보여 준다.","duties":["표지, 색상, 실습 도식의 시각 기준을 정합니다.","슬라이드·활동지·음성 안내를 대조하고 샘플과 다른 부분을 마루와 확인합니다.","통합본과 검토할 지점을 오검수에게 전달합니다."],"item":"스케치북","lead":true,"identity":"교안의 시각 방향을 책임지는 편집자","deliverable":"교안의 시각 기준을 정하고 통합본을 검토해 오검수에게 전달한다."}'::jsonb),
  ('studio-005', 'LPM', 'LPM_003', '콕', 2, 8, '{"role":"실습 안내·도식","mission":"실습자가 도식만 보고도 다음 동작과 성공 기준을 확인할 수 있게 합니다.","personality":"직설적이고 세부 표시를 꼼꼼히 챙깁니다.","strengths":"화면에서 눌러야 할 곳과 실제 치수의 기준점을 짚어 줍니다.","review":"표시를 많이 넣는 편입니다. 한 컷에서 한 가지 행동만 강조합니다.","duties":["검증된 샘플을 기준으로 한 컷에 한 동작을 표시합니다.","조작 위치, 치수, 단위, 방향을 이미지에 표시합니다.","대표 오류와 정상 결과를 비교하는 활동지 점검 항목을 만듭니다."],"outfit":"빨간 동그란 안경과 민트색 카디건","image":"studio-005-profile.png","birthDate":null,"item":"실습 안내 그림 한 장","identity":"한 컷에 한 동작을 담는 도식 제작자","deliverable":"샘플을 보고 단계별 도식과 완성 체크 항목을 만든다."}'::jsonb),
  ('studio-007', 'LPM', 'LPM_004', '소리', 2, 9, '{"role":"음성 안내·접근성","mission":"음성을 듣기 어렵거나 그림을 보기 어려워도 실습 순서를 파악할 수 있게 합니다.","personality":"듣는 사람의 입장에서 생각하고 말이 부드럽습니다.","strengths":"복잡한 설명을 짧은 음성 대본과 읽기 쉬운 자막으로 바꿉니다.","review":"분위기에 집중하다 핵심 지시가 늦어질 수 있습니다. 행동과 안전 안내부터 전합니다.","duties":["슬라이드에 맞춘 짧은 음성 대본과 자막을 작성합니다.","핵심 행동과 안전 안내를 자막에서도 확인할 수 있게 합니다.","실습 이미지에 대체 텍스트를 작성하고 화면·음성 안내를 대조합니다."],"outfit":"꽃 장식 헤드폰과 청록색 물방울 무늬 옷","image":"studio-007-profile.png","birthDate":null,"item":"휴대용 마이크","identity":"소리 없이도 이해되는 안내를 만드는 제작자","deliverable":"발표 대본, 자막, 이미지 대체 텍스트를 작성한다."}'::jsonb),
  ('agt-005', 'PT', 'PT_002', '강실습', 1, 10, '{"role":"실습·PPT","profile":"초등 3D 설계 실습과 강사 자료 제작 8년. 실용적이고 실행이 빠르다.","mission":"처음 만드는 학습자가 작업을 재현할 수 있는지 샘플로 시험합니다.","review":"익숙한 조작을 건너뛸 수 있다. 첫 입력과 대표 오류를 점검한다.","outfit":"세이지색 작업 재킷, 크림색 상의, 카고 팬츠","image":"agt-005-standing.png","birthDate":null,"personality":"실용적이고 실행이 빠르다.","strengths":"초보자도 따라 할 수 있도록 입력값, 조작, 결과를 한 장 PPT와 발표자 노트에 연결한다.","duties":["첫 입력값부터 완성까지 초보자 기준으로 따라 해 봅니다.","단계별 설정값, 예상 결과, 복구 방법을 기록합니다.","샘플 검증 결과와 강사 시연 포인트를 마루·교안제작팀에 전달합니다."],"item":"청록색 3D 출력 시험 모형","identity":"초보자 관점에서 샘플을 시험하는 제작자","deliverable":"입력값, 조작 순서, 예상 결과를 초보자 기준으로 시험하고 기록한다."}'::jsonb),
  ('studio-008', 'PT', 'PT_001', '마루', 0, 11, '{"role":"시제품 제작·작업실 기록","mission":"다른 강사도 같은 재료와 조건으로 반복 제작할 수 있는 샘플을 확정합니다.","personality":"차분하고 손에 익을 때까지 반복해서 시험합니다.","strengths":"재료 소모량, 작업 순서, 현장에서 생기는 오류를 구체적으로 기록합니다.","review":"손에 익은 동작을 설명에서 건너뛰기 쉽습니다. 시제품을 처음 보는 사람에게 절차를 따라 해 보게 합니다.","duties":["완성 기준에 맞춰 시제품을 만들고 재료 수량과 도구 조건을 기록합니다.","강실습과 반복 제작하며 소요 시간과 실패 조건을 확인합니다.","승인 샘플 사진과 제작 기록을 서화폭에게 전달합니다."],"outfit":"올려 묶은 머리, 세이지색 작업 재킷, 카고 팬츠","image":"studio-008-standing.png","birthDate":null,"item":"목재 조립 샘플","lead":true,"identity":"샘플의 재현성을 책임지는 제작자","deliverable":"샘플의 재료, 소요 시간, 실패 조건을 확인하고 검증 결과를 서화폭에게 전달한다."}'::jsonb),
  ('studio-004', 'OQ', 'OQ_002', '박자', 1, 12, '{"role":"일정 관리·수업 운영","mission":"수업일에 맞춰 팀별 산출물이 준비되도록 일정과 리허설을 관리합니다.","personality":"집중력이 높고 전환 시점을 잘 읽습니다.","strengths":"시연, 개인 작업, 질문 시간을 현실적으로 배분합니다.","review":"자기 속도로 연습하기 쉽습니다. 초보자 기준으로 시간을 재고 여유 시간을 둡니다.","duties":["수업일을 기준으로 기획·샘플·교안·검수 마감일을 정합니다.","팀 간 의존 일정과 지연 영향을 파트장에게 공유합니다.","리허설을 진행해 활동 시간을 재고 확정 일정표를 배포합니다."],"outfit":"청록 헤드폰, 청바지 멜빵, 색색의 메모","image":"studio-004-profile.png","birthDate":null,"item":"스톱워치","identity":"마감과 리허설을 조율하는 운영자","deliverable":"전체 마감표를 관리하고 리허설 시간과 지연 요인을 공유한다."}'::jsonb),
  ('agt-006', 'OQ', 'OQ_001', '오검수', 0, 13, '{"role":"품질 검수","profile":"교육 자료 검수와 수업 리허설 10년. ESTJ 캐릭터로 사람들을 조율하고 결함을 발견하면 담당자에게 바로 수정 지시한다.","mission":"요청과 승인 기준에 맞는 교안만 수업 운영 단계로 넘깁니다.","review":"작은 표현까지 다듬느라 검수가 길어질 수 있다. 수업을 막는 오류부터 처리하고 영향받는 부분을 다시 본다.","outfit":"올려 묶은 머리, 세이지색 니트, 크림색 바지","image":"agt-006-standing.png","birthDate":null,"personality":"ESTJ 캐릭터로 사람들을 조율하고 결함을 발견하면 담당자에게 바로 수정 지시한다.","strengths":"사용자 요청을 항목별로 대조하고 결함의 위치, 수정할 내용, 통과 기준을 명확히 전달한다. 수정 결과를 재검사한다.","duties":["요청 사항을 검수표로 만들고 교안·실습 샘플·리허설 결과를 대조합니다.","수정 위치, 수정 내용, 통과 기준을 담당 파트장에게 전달합니다.","수정본을 재검수하고 통과 결과를 박자와 정기록에게 공유합니다."],"item":"검수 체크리스트 클립보드","lead":true,"identity":"완료 기준을 지키는 검수 책임자","deliverable":"요청과 결과를 대조해 담당 파트장에게 수정 기준을 주고 수정본을 재검수한다."}'::jsonb),
  ('studio-003', 'OQ', 'OQ_003', '고요', 1, 14, '{"role":"품질 검수","mission":"실제 수강생이 막힐 지점을 수업 전에 발견해 재현 가능한 근거로 남깁니다.","personality":"말수가 적고 관찰이 세밀합니다.","strengths":"설명과 실제 결과가 어긋나는 지점을 잘 찾습니다.","review":"표현을 다듬다가 검수가 길어집니다. 안전, 재현 가능성, 요청 충족 순으로 봅니다.","duties":["교안만 보고 샘플을 따라 만들며 멈춘 단계와 조건을 기록합니다.","누락된 안내와 안전·접근성 문제를 우선순위로 정리합니다.","오류를 재현할 수 있는 근거를 오검수에게 전달합니다."],"outfit":"동그란 안경, 양쪽으로 묶은 머리, 창가","image":"studio-003-profile.png","birthDate":null,"item":"품질 체크리스트 클립보드","identity":"수강생이 막힐 지점을 찾는 검토자","deliverable":"초보자 관점에서 교안과 샘플을 대조해 오류 재현 조건을 기록한다."}'::jsonb),
  ('agt-007', 'OQ', 'OQ_004', '정기록', 2, 15, '{"role":"보관·기록","profile":"교육 산출물과 버전 관리 6년. 체계적이고 차분하다.","mission":"다음 교안에서 승인본과 채택 아이디어를 다시 찾을 수 있도록 기록합니다.","review":"기존 자료까지 정리하려 할 수 있다. 승인 범위의 파일만 갱신한다.","outfit":"베이지 카디건, 네이비 팬츠, 라벨이 달린 파일과 펜.","image":"agt-007-profile.png","birthDate":null,"personality":"체계적이고 차분하다.","strengths":"승인본, 파일명, 저장 경로, 색인과 대시보드를 맞춘다.","duties":["승인본·샘플·검수표의 버전과 저장 경로를 관리합니다.","채택 아이디어의 제안자와 채택 근거를 교안별로 기록합니다.","수업 후 평가와 개선점을 다음 기획에서 찾을 수 있게 색인에 연결합니다."],"item":"라벨 파일","identity":"팀의 배움과 승인본을 보관하는 기록자","deliverable":"승인본과 함께 아이디어 제안자, 채택 근거, 수업 후 개선점을 기록한다."}'::jsonb);
