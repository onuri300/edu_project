insert into public.tbl_comcode (code_group,code,name) values ('MENU_GROUP','mn_manual','Manual')
on conflict (code) do nothing;
update public.tbl_menu set group_code = 'mn_manual' where group_code = 'mn_'
  and menu_code in ('MN_DO_EQUIP','MN_DO_PROGRAM','MN_DO_GPT','MN_DO_DEV');
update public.tbl_comcode set name = 'Management' where code_group = 'MENU_GROUP' and code = 'mn_';
update public.tbl_comcode set name = 'Staff Management' where code_group = 'MENU' and code = 'MN_ON_PEOPLE';
update public.tbl_menu set group_code='mn_', group_order=5, subgroup_code=null,
  menu_order=case menu_code when 'MN_ON_NOTICE' then 1 when 'MN_VI_LIBRARY' then 2 else 3 end
where menu_code in ('MN_ON_NOTICE','MN_VI_LIBRARY','MN_ON_PEOPLE');
delete from public.tbl_comcode c where c.code_group = 'MENU_GROUP' and c.code in ('MG_ONURI_CLASS','MG_BOARD')
  and not exists (select 1 from public.tbl_menu m where m.group_code=c.code or m.subgroup_code=c.code);
