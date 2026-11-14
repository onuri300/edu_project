lock table public.tbl_emp, public.tbl_evalu in access exclusive mode;
alter table public.tbl_evalu drop constraint staff_evaluations_member_id_fkey;
update public.tbl_evalu evaluation
set member_id = employee.employee_code
from public.tbl_emp employee
where evaluation.member_id = employee.id;
alter table public.tbl_emp
  drop constraint staff_members_pkey,
  drop constraint staff_members_employee_code_key,
  drop column id;
alter table public.tbl_emp rename column employee_code to emp_code;
alter table public.tbl_emp add constraint tbl_emp_pkey primary key (emp_code);
alter table public.tbl_evalu add constraint tbl_evalu_emp_code_fkey
  foreign key (member_id) references public.tbl_emp(emp_code);
notify pgrst, 'reload schema';
