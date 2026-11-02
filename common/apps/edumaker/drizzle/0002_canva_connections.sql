CREATE TABLE `canva_connections` (
	`owner` text PRIMARY KEY NOT NULL,
	`tokens` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `canva_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`course_id` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_canva_jobs_owner_course` ON `canva_jobs` (`owner`,`course_id`);