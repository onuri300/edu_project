update storage.buckets set allowed_mime_types = array['text/plain', 'application/xml'], file_size_limit = 131072 where id = 'staff-guides';
update public.tbl_emp_guides set file_name = regexp_replace(file_name, '\.txt$', '.xml')
where file_name like 'seed/%.txt';
