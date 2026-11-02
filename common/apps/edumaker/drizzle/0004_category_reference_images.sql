CREATE TABLE `category_images` (
	`category_id` text NOT NULL,
	`slot` integer NOT NULL,
	`owner` text NOT NULL,
	`mime` text NOT NULL,
	`data` blob NOT NULL,
	`caption` text NOT NULL,
	`updated` text NOT NULL,
	PRIMARY KEY(`category_id`, `slot`)
);
