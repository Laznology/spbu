CREATE TABLE `fuels` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`provider_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `fuel_provider_id_idx` ON `fuels` (`provider_id`);--> statement-breakpoint
CREATE INDEX `fuel_name_idx` ON `fuels` (`name`);--> statement-breakpoint
CREATE TABLE `fuel_prices` (
	`id` text PRIMARY KEY NOT NULL,
	`fuel_id` text NOT NULL,
	`region_id` text NOT NULL,
	`price` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`fuel_id`) REFERENCES `fuels`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `fuel_price_fuel_id_idx` ON `fuel_prices` (`fuel_id`);--> statement-breakpoint
CREATE INDEX `fuel_price_region_id_idx` ON `fuel_prices` (`region_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `fuel_region_unq_idx` ON `fuel_prices` (`fuel_id`,`region_id`);--> statement-breakpoint
CREATE TABLE `providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `provider_name_idx` ON `providers` (`name`);--> statement-breakpoint
CREATE TABLE `regions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_ftz` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `region_name_idx` ON `regions` (`name`);