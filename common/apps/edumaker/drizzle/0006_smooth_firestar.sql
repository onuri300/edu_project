CREATE TABLE `canva_link_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_canva_link_category_owner_title` ON `canva_link_categories` (`owner`,`title`);--> statement-breakpoint
ALTER TABLE `canva_links` ADD `category_id` text DEFAULT '' NOT NULL;