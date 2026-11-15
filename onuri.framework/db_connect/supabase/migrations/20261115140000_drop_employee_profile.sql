alter table public.tbl_emp drop column profile;
notify pgrst, 'reload schema';
