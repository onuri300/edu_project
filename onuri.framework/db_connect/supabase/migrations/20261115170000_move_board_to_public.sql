alter table edumaker.board_posts set schema public;
alter function edumaker.stamp_board_post_update() set schema public;
drop schema edumaker restrict;
notify pgrst, 'reload schema';
