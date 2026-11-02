CREATE TABLE `canva_links` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`url` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_canva_links_owner_date` ON `canva_links` (`owner`,`date`);