((park) => {
'use strict';

const original = new URL('../', document.baseURI);
const zones = [
 ['vibe','Vibe Coding','오누리 창작 거리','🎨',69,38],
 ['class','Class. · 수업 활동','체험 놀이터','🎲',20,12],
 ['doc','Doc. · 문서','이야기 열차역','🚂',16,56],
 ['manual','Mng. · 매뉴얼','제작 공방','🛠',47,35],
 ['manage','Mng. · 관리','안내 광장','📚',82,73]
].map(([id,name,title,icon,x,y])=>({id,name,title,icon,x,y}));

const onuri='vi_vibe/vi_onuri/', onyou='vi_vibe/vi_onyou/', knu='vi_vibe/vi_knu.html';
const attractions = [
 ['vibe','lab','Onuri Maker Lab › Home','오누리 작업실',onuri+'vi_onuri.html','캐릭터, 굿즈, 디지털 문구 작업을 소개하는 포트폴리오 입구.'],
 ['vibe','works','Onuri Maker Lab › Works · 작품 전시','민화 회전목마',onuri+'vi_works.html','작업실의 캐릭터와 굿즈 포트폴리오를 관람하세요.',{gallery:'folk',missing:'같은 민화 작품의 흑백 선화와 레진 완성 사진, 작품별 색 설명'}],
 ['vibe','detail','Onuri Maker Lab › Works › 작업 상세','작품 확대경',onuri+'vi_detail.html','작품 상세 화면에는 캐릭터, 장면, 제작 과정과 전후 비교가 있습니다.',{gallery:'portfolio'}],
 ['vibe','about','Onuri Maker Lab › About','작업실 소개관',onuri+'vi_about.html','기존 포트폴리오의 작가와 강사 소개를 확인하세요.'],
 ['vibe','process','Onuri Maker Lab › Process','제작 기록 산책로',onuri+'vi_process.html','아이디어에서 시안, 제작과 완성까지의 흐름을 보는 공간입니다.'],
 ['vibe','contact','Onuri Maker Lab › Contact','작업실 우체국',onuri+'vi_contact.html','원본 포트폴리오의 문의 안내를 확인하세요.'],
 ['vibe','knu','Kyungnam University Makerspace','창의공작센터',knu,'경남대학교 3D창의공작센터는 3D 제작과 Blender 교육, 디지털 공작 장비 활용, 지역 진로교육을 지원합니다.'],
 ['vibe','knu-about','Kyungnam University Makerspace › About','센터 이야기',knu+'#about','2015년 제작 인프라를 구축하고, 2018년 메이커스페이스 운영기관으로 선정됐으며, 2025년 협업형 메이커스페이스에 참여했습니다.'],
 ['vibe','knu-program','Kyungnam University Makerspace › Programs & Support','제작 지원 부스',knu+'#programs','3D 제작·모델링 교육, 장비 활용·시제품 제작, 지역 연계·진로교육을 안내합니다.',{quiz:['센터에서 소개하는 모델링 교육 도구는 무엇인가요?',['Blender','스프레드시트','메일'],0,'교육 안내에 3D 제작과 Blender 교육이 나옵니다.']}],
 ['vibe','knu-fab','Kyungnam University Makerspace › Fabrication','디지털 제작실',knu+'#equipment','원본에서 제작 장비와 활용 분야를 확인하세요.'],
 ['vibe','knu-visit','Kyungnam University Makerspace › Visitor Guide','방문 안내소',knu+'#visit','센터는 경남대학교 제4공학관 1층에 있습니다. 방문 가능 시간과 이용 조건은 센터에 문의하세요.'],
 ['vibe','knu-contact','Kyungnam University Makerspace › Contact','센터 문의 창구',knu+'#contact','교육 프로그램, 장비 활용, 제작 지원, 단체 방문을 상담할 수 있습니다.'],
 ['vibe','onyou','Onyou Maker Card › 작가의 작업실','디지털 명함 공방',onyou+'vi_onyou.html','핫메이커 수업에서 사용하는 가상 작가의 디지털 명함 샘플입니다.',{gallery:'objects'}],
 ['vibe','show','Onyou Maker Card › 굿즈 쇼룸','굿즈 진열장',onyou+'vi_show.html','레이저 커팅, 3D 프린팅, 레진 아트의 예시를 둘러보세요.',{gallery:'objects'}],
 ['vibe','log','Onyou Maker Card › 메이킹 기록장','만들기 일지',onyou+'vi_log.html','온유 메이커 예시는 아이디어, 제작, 완성 순서로 작업을 기록합니다.',{order:['아이디어','제작','완성']}],
 ['vibe','festival','Onyou Maker Card › 실습 가이드','핫메이커 페스티벌',onyou+'vi_guide.html','디지털 명함 실습의 작업실, 굿즈 쇼룸, 기록장 샘플 부스를 둘러보세요.',{booths:['onyou','show','log'],download:['onyou-card-samples.zip','디지털 명함 예제 ZIP'],missing:'실제 팀별 문제 정의, 로고, 굿즈와 발표 자료 및 포트폴리오 링크'}],
 ['vibe','living','Living Lab Library','리빙랩 자료관','vi_vibe/vi_library.html','기존 리빙랩 자료실에서 원본 자료와 이용 가능한 다운로드를 확인하세요.'],
 ['class','idea','Edumaker Idea Card · 메이킹 아이디어 카드','아이디어 뽑기 광장','cl_class/cl_idea.html','카드로 메이킹 아이디어를 탐색하는 수업 활동입니다.',{play:'카드 뽑기'}],
 ['class','cards','IT Flashcards · IT 암기 카드','IT 카드 정원','cl_class/cl_cards.html','IT 용어를 카드로 복습합니다.',{quiz:['컴퓨터에서 임시 작업 데이터를 저장하는 메모리는?',['RAM','모니터','키보드'],0,'RAM은 실행 중인 프로그램과 데이터를 임시로 저장하는 메모리입니다.'],lesson:'RAM은 실행 중인 프로그램과 데이터를 임시로 저장하는 메모리입니다.'}],
 ['class','computer','Computer Quiz · 컴퓨터 퀴즈','컴퓨터 퀴즈관','cl_class/cl_quiz.html','입력 장치는 컴퓨터에 정보를 넣습니다. 키보드는 글자나 명령을 입력하는 장치입니다.',{quiz:['다음 중 입력 장치는?',['모니터','키보드','스피커'],1,'키보드는 글자나 명령을 입력하는 장치입니다.']}],
 ['class','ladder','Ladder Game · 사다리 타기','사다리 놀이터','cl_class/cl_ladder.html','원본 사다리 게임을 열거나 공원에서 제비뽑기를 해보세요.',{play:'제비뽑기'}],
 ['class','adult','Adult MBTI Test · 성인 MBTI','성인 성향 탐험관','cl_class/cl_mbti-a.html','성인용 원본 질문지를 열어 성향 활동에 참여할 수 있습니다.'],
 ['class','kids','Kids’ MBTI Test · 어린이 MBTI','어린이 성향 탐험관','cl_class/cl_mbti-k.html','어린이용 원본 질문지를 열어 성향 활동에 참여할 수 있습니다.'],
 ['doc','ai','AI Newsletter','AI 이야기 열차','do_docs/do_ai.html','AI 시대에 사람이 맡을 판단과 제작 검증을 살펴봅니다.',{reading:'ai.md',quiz:['캐릭터 키링 과제에서 제작 전에 점검할 것은?',['작은 부품과 고리 위치','완성 사진의 배경 음악','게시 날짜'],0,'AI 리포트는 작은 부품, 얇은 연결, 고리 위치를 제작 전에 점검하도록 안내합니다.'],lesson:'캐릭터 키링은 제작 전에 작은 부품, 얇은 연결, 고리 위치를 점검합니다.'}],
 ['doc','making','Making Newsletter','메이킹 이야기 열차','do_docs/do_making.html','AI·디지털 메이킹 리포트의 수업 아이디어를 읽어보세요.',{reading:'making.md',quiz:['3D 출력 굿즈의 SVG를 정리한 다음 먼저 검토하는 것은?',['크기와 출력 구조','전시 가격','촬영 배경'],0,'원문은 SVG 정리 다음에 크기와 출력 구조를 검토하도록 안내합니다.'],lesson:'수업 예시에서는 SVG를 정리한 다음 크기와 출력 구조를 검토하고, 슬라이싱 예상을 비교합니다.'}],
 ['doc','books','Books · 읽을거리','배움 도서관','do_docs/do_books.html','원본 읽을거리와 레진아트 자료를 열 수 있습니다.',{download:['resin-art.pdf','레진아트 PDF']}],
 ['manual','equipment','Equipment · 장비','메이커 미션 타워','mn_manual/mn_equip.html','메이킹 리포트의 굿즈 제작 순서를 살펴보세요. 대상에 맞는 시안을 고른 뒤 SVG를 정리하고, 크기와 구조를 확인한 다음 슬라이싱 예상을 비교합니다.',{order:['시안 고르기','SVG 정리','크기와 출력 구조 확인','슬라이싱 예상 비교'],related:'making'}],
 ['manual','programs','Programs · 프로그램','디지털 도구 공방','mn_manual/mn_program.html','원본 프로그램 매뉴얼에서 Inkscape와 제작 도구의 사용법을 찾아보세요.'],
 ['manual','gpt','AI · 인공지능','AI 실험실','mn_manual/mn_ai.html','원본 AI 매뉴얼의 활용 예제와 제작 안내를 찾아보세요.'],
 ['manual','dev','Dev · 개발 명세','개발 설계실','mn_manual/mn_dev.html','원본 포털의 시스템과 레이아웃 개발 문서를 확인하세요.'],
 ['manage','notice','Board · 게시판 › Notice · 공지사항','안내센터','mn_manage/mn_notice.html','공지는 원본 게시판에서 날짜와 본문을 확인하세요.',{missing:'공원에 게시할 공지 제목, 날짜와 본문'}],
 ['manage','library','Board · 게시판 › 자료실','수업 자료 도서관','mn_manage/mn_library.html','온유 디지털 명함 예제는 바로 받을 수 있습니다. 추가 교안은 원본 자료실에서 확인하세요.',{download:['onyou-card-samples.zip','디지털 명함 예제 ZIP'],missing:'공개 가능한 게시판 교안·활동지 목록과 연결 주소'}],
 ['manage','agent','Agent Mng. · 에이전트 관리','운영 안내실','mn_manage/mn_staff.html','원본 운영 화면에서 기존 계정으로 이용하는 항목입니다.',{missing:'방문자에게 공개할 운영 안내 문서'}]
].map(([zone,id,name,title,path,body,details])=>({zone,id,name,title,path,body,...details}));

const galleries = {
 folk:[['레진 플라워','resin-flower.webp'],['아크릴 키링','keyring.webp']],
 objects:[['아크릴 키링','keyring.webp'],['케이블 홀더','holder.webp'],['레진 플라워','resin-flower.webp']],
 portfolio:[['제작 전','portfolio-before.jpg'],['제작 후','portfolio-after.jpg']]
};

park.parkData = { original, zones, attractions, galleries };
})(window.onuriMakerPark ??= {});
