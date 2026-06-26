CREATE TABLE `fuel_price_history` (
	`id` text PRIMARY KEY NOT NULL,
	`fuel_id` text NOT NULL,
	`region_id` text NOT NULL,
	`price` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`fuel_id`) REFERENCES `fuels`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `fuel_price_history_fuel_id_idx` ON `fuel_price_history` (`fuel_id`);--> statement-breakpoint
CREATE INDEX `fuel_price_history_region_id_idx` ON `fuel_price_history` (`region_id`);