insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('staff-guides','staff-guides',false,65536,array['text/plain']);

create table public.tbl_emp_guides (
  emp_code text primary key references public.tbl_emp(emp_code) on update cascade,
  file_name text not null unique
);
alter table public.tbl_emp_guides enable row level security;
revoke all on public.tbl_emp_guides from public, anon, authenticated;
grant select, insert, update, delete on public.tbl_emp_guides to authenticated;
create policy staff_guide_admin on public.tbl_emp_guides to authenticated
  using (exists (select 1 from public.tbl_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.tbl_users where user_id = (select auth.uid())));
create policy staff_guide_file_admin on storage.objects to authenticated
  using (bucket_id = 'staff-guides' and exists (select 1 from public.tbl_users where user_id = (select auth.uid())))
  with check (bucket_id = 'staff-guides' and exists (select 1 from public.tbl_users where user_id = (select auth.uid())));
notify pgrst, 'reload schema';
insert into public.tbl_emp_guides(emp_code,file_name)
select emp_code, 'seed/' || emp_code || '.txt' from public.tbl_emp
where emp_code in ('PT_001','PT_002','PT_003','LPM_001','LPM_002','LPM_003','LPM_004');
