alter table public.tbl_users add column display_name text not null default '관리자'
  check (char_length(btrim(display_name)) between 1 and 80);

alter table public.tbl_board rename column id to board_id;
alter table public.tbl_board drop constraint board_posts_author_id_fkey;
alter table public.tbl_board add constraint tbl_board_author_id_fkey
  foreign key (author_id) references public.tbl_users(user_id);
-- Keep the deployed page compatible until it switches to board_id.
alter table public.tbl_board add column id bigint generated always as (board_id) stored;
grant select (id) on public.tbl_board to anon, authenticated;

create function public.board_author_name(post public.tbl_board)
returns text language sql stable security definer set search_path = ''
as $$
  select u.display_name
  from public.tbl_board b
  join public.tbl_users u on u.user_id = b.author_id
  where b.board_id = post.board_id and (
    (b.published and exists (
      select 1 from public.tbl_comcode c
      where c.code_group = 'BOARD' and c.code = b.board_type and c.public_read
    )) or exists (
      select 1 from public.tbl_users admin where admin.user_id = (select auth.uid())
    )
  );
$$;
revoke all on function public.board_author_name(public.tbl_board) from public;
grant execute on function public.board_author_name(public.tbl_board) to anon, authenticated;
notify pgrst, 'reload schema';
