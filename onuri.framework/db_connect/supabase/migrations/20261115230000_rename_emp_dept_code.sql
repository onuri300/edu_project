alter table public.tbl_emp rename column department_code to dept_code;
notify pgrst, 'reload schema';
