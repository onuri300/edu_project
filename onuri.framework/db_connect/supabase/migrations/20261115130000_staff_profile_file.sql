alter table public.tbl_emp add column profile_file text;
update public.tbl_emp set profile_file = emp_code || '.profile.xml';
alter table public.tbl_emp alter column profile_file set not null;
alter table public.tbl_emp add constraint tbl_emp_profile_file_unique unique (profile_file);
notify pgrst, 'reload schema';
