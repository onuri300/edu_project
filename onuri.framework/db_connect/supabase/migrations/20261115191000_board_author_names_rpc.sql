create function public.board_author_names(ids bigint[])
returns table(board_id bigint, display_name text)
language sql stable security definer set search_path = ''
as $$
  select b.board_id, u.display_name
  from public.tbl_board b join public.tbl_users u on u.user_id = b.author_id
  where b.board_id = any(ids) and (
    (b.published and exists (select 1 from public.tbl_comcode c
      where c.code_group = 'BOARD' and c.code = b.board_type and c.public_read))
    or exists (select 1 from public.tbl_users a where a.user_id = (select auth.uid()))
  );
$$;
revoke all on function public.board_author_names(bigint[]) from public;
grant execute on function public.board_author_names(bigint[]) to anon, authenticated;
drop function public.board_author_name(public.tbl_board);
notify pgrst, 'reload schema';
