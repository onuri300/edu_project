alter table public.tbl_comcode drop constraint tbl_comcode_code_group_check;
alter table public.tbl_comcode add constraint tbl_comcode_code_group_check
  check (code_group in ('DEPT', 'BOARD', 'MENU_GROUP', 'MENU'));

insert into public.tbl_comcode (code, code_group, name) values
  ('MG_VIBE', 'MENU_GROUP', 'Vibe Coding'),
  ('MG_GAMES', 'MENU_GROUP', 'Games'),
  ('MG_DOCUMENT', 'MENU_GROUP', 'Document'),
  ('MG_ONURI_CLASS', 'MENU_GROUP', 'onuriClass'),
  ('MG_QUIZ', 'MENU_GROUP', 'Quiz');

insert into public.tbl_comcode (code, code_group, name)
select 'MN_' || upper(replace(substring(page_path from '([^/]+)[.]html$'), '-', '_')), 'MENU', menu_name
from public.tbl_menu;

create policy portal_menu_code_read on public.tbl_comcode for select to anon, authenticated
  using (code_group in ('MENU_GROUP', 'MENU'));

alter table public.tbl_menu
  add column group_code text,
  add column menu_code text,
  add column subgroup_code text,
  add column group_code_type text generated always as ('MENU_GROUP'::text) stored,
  add column menu_code_type text generated always as ('MENU'::text) stored;

update public.tbl_menu set
  group_code = case group_name
    when 'Vibe Coding' then 'MG_VIBE' when 'Games' then 'MG_GAMES'
    when 'Document' then 'MG_DOCUMENT' when 'onuriClass' then 'MG_ONURI_CLASS' end,
  menu_code = 'MN_' || upper(replace(substring(page_path from '([^/]+)[.]html$'), '-', '_')),
  subgroup_code = case when subgroup_name = 'Quiz' then 'MG_QUIZ' end;

alter table public.tbl_menu
  alter column group_code set not null,
  alter column menu_code set not null,
  add constraint tbl_menu_group_code_fk foreign key (group_code_type, group_code)
    references public.tbl_comcode (code_group, code),
  add constraint tbl_menu_subgroup_code_fk foreign key (group_code_type, subgroup_code)
    references public.tbl_comcode (code_group, code),
  add constraint tbl_menu_menu_code_fk foreign key (menu_code_type, menu_code)
    references public.tbl_comcode (code_group, code),
  add constraint tbl_menu_menu_code_unique unique (menu_code),
  drop column group_name,
  drop column menu_name,
  drop column subgroup_name;
grant select (group_code, menu_code, subgroup_code, group_code_type, menu_code_type)
  on public.tbl_menu to anon, authenticated;
notify pgrst, 'reload schema';
