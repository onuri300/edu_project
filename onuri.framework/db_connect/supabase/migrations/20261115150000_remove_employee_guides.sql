lock table public.tbl_emp_guides in access exclusive mode;
do $$ begin
  if exists (select 1 from public.tbl_emp_guides where file_name not like 'seed/%') then
    raise exception 'Edited guides require migration';
  end if;
end $$;
grant update (profile_file) on public.tbl_emp to authenticated;
drop table public.tbl_emp_guides;
notify pgrst, 'reload schema';
