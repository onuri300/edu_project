create or replace function public.bd_valid_attachment_paths(paths text[])
returns boolean language sql immutable set search_path = ''
as $$
  select not exists (
    select 1 from unnest(paths) as p(path)
    where char_length(path) > 1024
      or path !~ '^(mn_manage/mn_files/|bd_board/bd_files/|common/file/cl[.]file/)[^/]+'
      or path ~ '(^|/)[.]{1,2}(/|$)|//|/$|[%?#:[:cntrl:]]'
      or strpos(path, chr(92)) > 0
  )
$$;
