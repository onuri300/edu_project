create table public.tbl_menu (
  menu_id bigint generated always as identity primary key,
  group_name text not null check (length(btrim(group_name)) > 0),
  group_order integer not null check (group_order > 0),
  subgroup_name text,
  menu_name text not null check (length(btrim(menu_name)) > 0),
  page_path text not null unique check (page_path ~ '^[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*[.]html$'),
  menu_order integer not null check (menu_order > 0),
  worker_id uuid not null default auth.uid() references public.tbl_users(user_id),
  worked_at timestamptz not null default now(),
  unique (group_order, menu_order)
);
alter table public.tbl_menu enable row level security;
revoke all on public.tbl_menu from public, anon, authenticated;
grant select (menu_id, group_name, group_order, subgroup_name, menu_name, page_path, menu_order)
  on public.tbl_menu to anon, authenticated;
create policy portal_menu_read on public.tbl_menu for select to anon, authenticated using (true);

-- Attribute initial menu metadata to the existing site administrator.
insert into public.tbl_menu (group_name, group_order, menu_name, page_path, subgroup_name, menu_order, worker_id)
select seed.*, (select user_id from public.tbl_users order by created_at, user_id limit 1)
from (values
  ('Vibe Coding', 1, 'OnuriMakerLab', 'vi_vibe/vi_onuri/vi_onuri.html', null, 1),
  ('Vibe Coding', 1, 'Kyungnam University Makerspace', 'vi_vibe/vi_knu.html', null, 2),
  ('Vibe Coding', 1, 'Onyou Maker Card', 'vi_vibe/vi_onyou/vi_onyou.html', null, 3),
  ('Vibe Coding', 1, 'Living Lab Library', 'vi_vibe/vi_library.html', null, 4),
  ('Games', 2, 'Ladder Game', 'ga_games/ga_ladder.html', null, 1),
  ('Games', 2, 'Adult MBTI Test', 'ga_games/ga_mbti-a.html', null, 2),
  ('Games', 2, 'Kids’ MBTI Test', 'ga_games/ga_mbti-k.html', null, 3),
  ('Games', 2, 'Edumaker Idea Card', 'ga_games/ga_idea.html', null, 4),
  ('Document', 3, 'GPT Manual', 'do_docs/do_gpt.html', null, 1),
  ('Document', 3, 'Dev Manual', 'do_docs/do_dev.html', null, 2),
  ('Document', 3, 'Making Newsletter', 'do_docs/do_making.html', null, 3),
  ('Document', 3, 'AI Newsletter', 'do_docs/do_ai.html', null, 4),
  ('onuriClass', 4, 'Announcements', 'on_class/on_notice.html', null, 1),
  ('onuriClass', 4, '인사관리', 'on_class/on_people.html', null, 2),
  ('onuriClass', 4, 'IT Flashcards', 'on_class/on_quiz/on_cards.html', 'Quiz', 3),
  ('onuriClass', 4, 'Computer Quiz', 'on_class/on_quiz/on_quiz.html', 'Quiz', 4)
) as seed(group_name, group_order, menu_name, page_path, subgroup_name, menu_order);
notify pgrst, 'reload schema';
