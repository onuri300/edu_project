do $$
declare item record;
begin
  for item in
    select p.oid::regprocedure as signature from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='edumaker' and p.proname <> 'stamp_board_post_update'
  loop
    execute format('drop routine %s', item.signature);
  end loop;
end $$;

drop table edumaker.canva_connections, edumaker.canva_jobs, edumaker.canva_link_categories,
  edumaker.canva_links, edumaker.category_images, edumaker.courses, edumaker.journal_categories,
  edumaker.journals, edumaker.news_articles, edumaker.sessions, edumaker.slide_sources,
  edumaker.slides, edumaker.storage_credentials;

notify pgrst, 'reload schema';
