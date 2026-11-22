grant insert (created_at), update (created_at) on public.tbl_board to authenticated;
drop trigger board_posts_stamp_update on public.tbl_board;
create trigger board_posts_stamp_update before update of title, content, published, board_type, attachment_paths, created_at
on public.tbl_board for each row execute function public.stamp_board_post_update();
notify pgrst, 'reload schema';
