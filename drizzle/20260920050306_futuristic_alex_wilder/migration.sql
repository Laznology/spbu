CREATE TABLE `fuel` (
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`effective_at` integer NOT NULL,
	`fuel_id` text NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`price` integer NOT NULL,
	`region_id` text NOT NULL,
	CONSTRAINT `fk_fuel_fuel_id_fuels_id_fk` FOREIGN KEY (`fuel_id`) REFERENCES `fuels`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_fuel_region_id_regions_id_fk` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `fuels` (
	`id` text PRIMARY KEY,
	`is_subsidized` integer DEFAULT false NOT NULL,
	`name` text NOT NULL UNIQUE,
	`provider_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `regions` (
	`id` text PRIMARY KEY,
	`is_ftz` integer DEFAULT false NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_price_snapshot_idx` ON `fuel` (`fuel_id`,`region_id`,`effective_at`);--> statement-breakpoint
CREATE INDEX `lookup_region_fuel_idx` ON `fuel` (`region_id`,`fuel_id`,`effective_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `fuel_provider_name_idx` ON `fuels` (`provider_id`,`name`);