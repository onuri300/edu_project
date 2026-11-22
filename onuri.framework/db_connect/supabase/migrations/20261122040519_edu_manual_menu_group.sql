insert into public.tbl_comcode (code_group,code,name) values
  ('MENU_GROUP','mn_','Manual'),('MENU','MN_DO_PROGRAM','Programs')
on conflict (code) do nothing;
update public.tbl_comcode c set name = v.name
from (values ('MN_DO_EQUIP','Equipment'),('MN_DO_GPT','AI'),('MN_DO_DEV','Dev')) as v(code,name)
where c.code_group = 'MENU' and c.code = v.code;
update public.tbl_menu set group_code = 'mn_', group_order = 6,
  menu_order = case menu_code when 'MN_DO_EQUIP' then 1 when 'MN_DO_GPT' then 3 else 4 end
where menu_code in ('MN_DO_EQUIP','MN_DO_GPT','MN_DO_DEV');
insert into public.tbl_menu (group_code, group_order, menu_code, menu_order, page_path, worker_id)
select 'mn_',6,'MN_DO_PROGRAM',2,'do_docs/do_program.html',worker_id
from public.tbl_menu where menu_code='MN_DO_EQUIP'
on conflict (menu_code) do nothing;
