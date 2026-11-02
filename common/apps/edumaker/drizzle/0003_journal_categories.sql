CREATE TABLE `journal_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`payload` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_journal_categories_owner` ON `journal_categories` (`owner`,`updated`);