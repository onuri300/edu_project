drop view public.tbl_board restrict;
alter table public.board_posts rename to tbl_board;
revoke all on public.tbl_board from public, anon, authenticated;
revoke select (id, board_type, title, content, published, author_id, created_at, updated_at),
  insert (board_type, title, content, published, author_id, updated_at),
  update (title, content, published, updated_at) on public.tbl_board from anon, authenticated;
grant select (id, board_type, title, content, published, created_at, updated_at)
  on public.tbl_board to anon, authenticated;
grant insert (board_type, title, content, published), update (title, content, published), delete
  on public.tbl_board to authenticated;
notify pgrst, 'reload schema';
