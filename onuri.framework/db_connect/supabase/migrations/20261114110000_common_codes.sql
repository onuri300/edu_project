create table public.tbl_comcode (
  code text primary key,
  code_group text not null check (code_group in ('DEPT', 'BOARD')),
  name text not null check (length(trim(name)) > 0),
  public_read boolean not null default false,
  unique (code_group, code),
  check (not public_read or code_group = 'BOARD')
);

insert into public.tbl_comcode (code, code_group, name)
select code, 'DEPT', name from public.tbl_dept;
insert into public.tbl_comcode (code, code_group, name, public_read)
values ('notice', 'BOARD', '공지사항', true);

alter table public.tbl_comcode enable row level security;
revoke all on public.tbl_comcode from public, anon, authenticated;
grant select on public.tbl_comcode to anon, authenticated;
create policy "read public board codes" on public.tbl_comcode for select to anon, authenticated
  using (code_group = 'BOARD' and public_read);
create policy "admins read common codes" on public.tbl_comcode for select to authenticated
  using (exists (select 1 from public.tbl_users where user_id = (select auth.uid())));

alter table public.tbl_dept
  add column code_group text generated always as ('DEPT'::text) stored,
  add constraint tbl_dept_comcode_fk foreign key (code_group, code)
    references public.tbl_comcode (code_group, code),
  drop column name;

alter table edumaker.board_posts
  add column code_group text generated always as ('BOARD'::text) stored,
  add constraint tbl_board_comcode_fk foreign key (code_group, board_type)
    references public.tbl_comcode (code_group, code);

alter policy "everyone read published notices" on edumaker.board_posts
  using (published and exists (
    select 1 from public.tbl_comcode c
    where c.code_group = 'BOARD' and c.code = board_type and c.public_read
  ));
alter policy "administrators read all notices" on edumaker.board_posts
  using (exists (select 1 from public.tbl_users where user_id = (select auth.uid())));
alter policy "admin create announcements" on edumaker.board_posts
  with check (author_id = (select auth.uid()) and
    exists (select 1 from public.tbl_users where user_id = (select auth.uid())));
alter policy "admin edit announcements" on edumaker.board_posts
  using (exists (select 1 from public.tbl_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.tbl_users where user_id = (select auth.uid())));
alter policy "admin delete announcements" on edumaker.board_posts
  using (exists (select 1 from public.tbl_users where user_id = (select auth.uid())));

notify pgrst, 'reload schema';
