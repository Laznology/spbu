CREATE TABLE `sync_states` (
	`key` text PRIMARY KEY,
	`last_effective_at` integer,
	`last_message` text,
	`last_status` integer DEFAULT 0 NOT NULL,
	`last_synced_at` text DEFAULT (CURRENT_TIMESTAMP),
	`total_evaluated` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE `fuel` RENAME TO `fuel_price_histories`;
