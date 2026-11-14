alter table public.staff_members rename to tbl_emp;
alter table public.staff_departments rename to tbl_dept;
alter table public.staff_evaluations rename to tbl_evalu;
alter table public.board_posts rename to tbl_board;
alter table public.admin_users rename to tbl_users;
notify pgrst, 'reload schema';
