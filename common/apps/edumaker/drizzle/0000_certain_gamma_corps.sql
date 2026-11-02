CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`topic` text NOT NULL,
	`payload` text NOT NULL,
	`updated` text NOT NULL
);
