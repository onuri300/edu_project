# 공통 게시판 관리

- `mn_manage/mn_notice.html`과 `mn_manage/mn_library.html`은 게시판 키와 기본 제목을 지정하는 진입 페이지입니다. 두 페이지는 `mn_template.js`, `mn_board.js`, `mn_board.css`를 사용합니다.
- 새 게시판은 `tbl_comcode`의 `BOARD` 항목에 키와 이름을 등록하고, 같은 이름과 키를 지정한 `mn_*.html`을 추가합니다. 공개 게시판이면 `public_read`와 사이트의 공개 경로 설정을 함께 지정합니다. 포털 메뉴는 `MENU` 코드를 만들고 `tbl_menu`에서 `mn_` 그룹에 연결합니다.
- 게시글은 `tbl_board.board_type`으로 구분합니다. 작성자는 기존 관리자 계정을 사용하고, 공개 여부에 따라 읽기 권한이 적용됩니다. 게시판 이름을 수정할 때는 `BOARD` 이름, `MENU` 이름, HTML의 기본 제목을 함께 바꿉니다.
- 새 첨부파일을 `mn_manage/mn_files/`에 보관한 후 글 작성에서 파일 선택으로 추가합니다. 기존 자료실 PDF는 `common/file/cl.file/`에서 그대로 읽습니다. 파일을 옮기거나 이름을 바꾸면 글의 경로도 함께 수정합니다.
- 공개 게시글의 첨부파일은 웹사이트에서 내려받을 수 있습니다. 비공개 초안에 쓰는 파일은 공개 파일 폴더에 넣기 전에 공개 여부를 확인합니다.
- 기존 포털 주소는 이전 배포본과 저장된 링크를 위해 유지합니다. 업데이트한 포털에서는 Notice와 Library를 `mn_manage` 진입 페이지로 엽니다. 예전 공지 주소는 `mn_manage/mn_notice.html`로 연결합니다.
