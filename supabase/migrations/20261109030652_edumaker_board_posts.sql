-- Move the existing rows, identity sequence and foreign keys into one board table.
alter table public.announcements set schema edumaker;
alter table edumaker.announcements rename to board_posts;
alter table edumaker.board_posts
  add column board_type text not null default 'notice',
  add column updated_by uuid references auth.users(id) on delete set null,
  alter column author_id set default auth.uid(),
  add constraint board_posts_board_type_check check (board_type ~ '^[a-z][a-z0-9_]{0,39}$');

alter table edumaker.board_posts rename constraint announcements_pkey to board_posts_pkey;
alter table edumaker.board_posts rename constraint announcements_author_id_fkey to board_posts_author_id_fkey;
alter table edumaker.board_posts rename constraint announcements_title_check to board_posts_title_check;
alter table edumaker.board_posts rename constraint announcements_content_check to board_posts_content_check;
drop index edumaker.announcements_published_created_idx;
create index board_posts_type_created_idx on edumaker.board_posts (board_type, created_at desc, id desc);
create index board_posts_type_published_idx on edumaker.board_posts (board_type, created_at desc, id desc) where published;
create index board_posts_author_idx on edumaker.board_posts (author_id);
create index board_posts_updater_idx on edumaker.board_posts (updated_by) where updated_by is not null;

create function edumaker.stamp_board_post_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := clock_timestamp();
  new.updated_by := auth.uid();
  return new;
end;
$$;
revoke all on function edumaker.stamp_board_post_update() from public, anon, authenticated, service_role;
create trigger board_posts_stamp_update before update of title, content, published, board_type
on edumaker.board_posts for each row execute function edumaker.stamp_board_post_update();

-- Keep the public notice rules scoped to notice rows. New board types can define
-- their own policies without inheriting public access.
alter policy "everyone read published notices" on edumaker.board_posts
  using (board_type = 'notice' and published);
alter policy "administrators read all notices" on edumaker.board_posts
  using (board_type = 'notice' and exists (select 1 from public.admin_users where user_id = (select auth.uid())));
alter policy "admin create announcements" on edumaker.board_posts
  with check (board_type = 'notice' and author_id = (select auth.uid())
    and exists (select 1 from public.admin_users where user_id = (select auth.uid())));
alter policy "admin edit announcements" on edumaker.board_posts
  using (board_type = 'notice' and exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (board_type = 'notice' and exists (select 1 from public.admin_users where user_id = (select auth.uid())));
alter policy "admin delete announcements" on edumaker.board_posts
  using (board_type = 'notice' and exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- Expose only the board views; edumaker remains outside the Data API schemas.
grant usage on schema edumaker to authenticated, service_role;
revoke all on edumaker.board_posts from public, anon, authenticated;
grant select (id, board_type, title, content, published, author_id, created_at, updated_at)
  on edumaker.board_posts to anon, authenticated;
grant insert (board_type, title, content, published, author_id, updated_at),
  update (title, content, published, updated_at), delete on edumaker.board_posts to authenticated;

create view public.board_posts with (security_invoker = true) as
  select id, board_type, title, content, published, created_at, updated_at
  from edumaker.board_posts;
revoke all on public.board_posts from public, anon, authenticated, service_role;
grant select on public.board_posts to anon, authenticated;
grant insert (board_type, title, content, published), update (title, content, published), delete
  on public.board_posts to authenticated;

-- Cached or older pages keep working with the same rows during deployment.
create view public.announcements with (security_invoker = true) as
  select id, title, content, published, author_id, created_at, updated_at
  from edumaker.board_posts where board_type = 'notice'
  with local check option;
revoke all on public.announcements from public, anon, authenticated, service_role;
grant select on public.announcements to anon, authenticated, service_role;
grant insert (title, content, published, author_id, updated_at),
  update (title, content, published, updated_at), delete on public.announcements to authenticated, service_role;
