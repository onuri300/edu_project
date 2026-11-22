update public.tbl_board
set attachment_paths = array_remove(array_remove(attachment_paths, 'bd_board/bd_files/레이저_명함QR.png'), 'bd_board/bd_files/photothumb.db')
where board_id = 8 and attachment_paths && array['bd_board/bd_files/레이저_명함QR.png', 'bd_board/bd_files/photothumb.db'];
