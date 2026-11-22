alter table public.tbl_board
  add column attachment_paths text[] not null default '{}',
  add column view_count bigint not null default 0 check (view_count >= 0),
  add constraint bd_attachment_count check (cardinality(attachment_paths) <= 20 and array_position(attachment_paths, null) is null);

create function public.bd_valid_attachment_paths(paths text[])
returns boolean language sql immutable set search_path = ''
as $$
  select not exists (
    select 1 from unnest(paths) as p(path)
    where char_length(path) > 1024
      or path !~ '^(bd_board/bd_files/|common/file/cl[.]file/)[^/]+'
      or path ~ '(^|/)[.]{1,2}(/|$)|//|/$|[%?#:[:cntrl:]]'
      or strpos(path, chr(92)) > 0
  )
$$;
revoke all on function public.bd_valid_attachment_paths(text[]) from public;
grant execute on function public.bd_valid_attachment_paths(text[]) to authenticated, service_role;
alter table public.tbl_board add constraint bd_attachment_paths_check
  check (public.bd_valid_attachment_paths(attachment_paths));

grant select (attachment_paths, view_count) on public.tbl_board to anon, authenticated;
grant insert (attachment_paths), update (attachment_paths) on public.tbl_board to authenticated;

drop trigger board_posts_stamp_update on public.tbl_board;
create trigger board_posts_stamp_update before update of title, content, published, board_type, attachment_paths
on public.tbl_board for each row execute function public.stamp_board_post_update();

create function public.bd_register_view(post_id bigint, post_type text)
returns bigint language sql security definer set search_path = ''
as $$
  update public.tbl_board b set view_count = b.view_count + 1
  where b.board_id = post_id and b.board_type = post_type and b.published
    and exists (select 1 from public.tbl_comcode c
      where c.code_group = 'BOARD' and c.code = b.board_type and c.public_read)
  returning b.view_count
$$;
revoke all on function public.bd_register_view(bigint, text) from public;
grant execute on function public.bd_register_view(bigint, text) to anon, authenticated;

insert into public.tbl_comcode (code, code_group, name, public_read)
values ('library', 'BOARD', '자료실', true), ('MG_BOARD', 'MENU_GROUP', '게시판', false)
on conflict (code_group, code) do nothing;

-- Reuse the administrator who authored the existing notice for the imported file.
insert into public.tbl_board (board_type, title, content, published, author_id, attachment_paths)
select 'library', '레진아트', '리빙랩 수업 교안입니다. 첨부 PDF를 내려받을 수 있습니다.', true,
  n.author_id, array['common/file/cl.file/001_레진아트.pdf']
from public.tbl_board n
where n.board_type = 'notice' and not exists (
  select 1 from public.tbl_board b where b.board_type = 'library'
    and b.attachment_paths @> array['common/file/cl.file/001_레진아트.pdf'])
order by n.board_id limit 1;

update public.tbl_comcode set name = '공지사항' where code_group = 'MENU' and code = 'MN_ON_NOTICE';
update public.tbl_comcode set name = '자료실' where code_group = 'MENU' and code = 'MN_VI_LIBRARY';

-- Existing deployed entry paths remain valid. The updated portal resolves these to bd_board.
update public.tbl_menu set group_code = 'MG_BOARD', group_order = 5,
  menu_order = case menu_code when 'MN_ON_NOTICE' then 1 else 2 end
where menu_code in ('MN_ON_NOTICE', 'MN_VI_LIBRARY');

notify pgrst, 'reload schema';
