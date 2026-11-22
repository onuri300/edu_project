insert into public.tbl_comcode (code_group,code,name) values ('MENU_GROUP','cl_','Class Activities')
on conflict (code) do update set name = excluded.name;
update public.tbl_menu set group_code = 'cl_', group_order = 7, subgroup_code = null,
  menu_order = case menu_code when 'MN_GA_IDEA' then 1 when 'MN_ON_CARDS' then 2 when 'MN_ON_QUIZ' then 3
                             when 'MN_GA_LADDER' then 4 when 'MN_GA_MBTI_A' then 5 else 6 end
where menu_code in ('MN_GA_IDEA','MN_ON_CARDS','MN_ON_QUIZ','MN_GA_LADDER','MN_GA_MBTI_A','MN_GA_MBTI_K');
