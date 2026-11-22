do $$
begin
  if exists (
    select 1 from public.tbl_board b cross join lateral unnest(b.attachment_paths) f(path)
    where f.path like 'bd_board/%' or f.path like 'on_class/%'
  ) then raise exception 'Legacy attachment paths must be resolved before cutover'; end if;
end
$$;
update public.tbl_menu m set page_path = v.target
from (values
  ('MN_ON_NOTICE','mn_manage/mn_notice.html'),
  ('MN_VI_LIBRARY','mn_manage/mn_library.html'),
  ('MN_ON_PEOPLE','mn_manage/mn_staff.html'),
  ('MN_ON_CARDS','cl_class/cl_cards.html'),
  ('MN_ON_QUIZ','cl_class/cl_quiz.html')
) as v(menu_code,target)
where m.menu_code=v.menu_code and m.page_path is distinct from v.target;
