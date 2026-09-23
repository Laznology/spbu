import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const regions = sqliteTable("regions", {
  id: text("id").primaryKey(),
  isFtz: integer("is_ftz", { mode: "boolean" }).notNull().default(false),
  name: text("name").notNull(),
});

export const fuels = sqliteTable(
  "fuels",
  {
    id: text("id").primaryKey(),
    isSubsidized: integer("is_subsidized", { mode: "boolean" })
      .notNull()
      .default(false),
    name: text("name").notNull().unique(),
    providerId: text("provider_id").notNull(),
  },
  (t) => [uniqueIndex("fuel_provider_name_idx").on(t.providerId, t.name)]
);

export const fuelPriceHistory = sqliteTable(
  "fuel_price_histories",
  {
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    effectiveAt: integer("effective_at").notNull(),
    fuelId: text("fuel_id")
      .notNull()
      .references(() => fuels.id, { onDelete: "cascade" }),
    id: integer("id").primaryKey({ autoIncrement: true }),
    price: integer("price").notNull(),
    regionId: text("region_id")
      .notNull()
      .references(() => regions.id, { onDelete: "cascade" }),
  },
  (t) => [
    uniqueIndex("unique_price_snapshot_idx").on(
      t.fuelId,
      t.regionId,
      t.effectiveAt
    ),
    index("lookup_region_fuel_idx").on(t.regionId, t.fuelId, t.effectiveAt),
  ]
);

export const syncState = sqliteTable("sync_states", {
  key: text("key").primaryKey(),
  lastEffectiveAt: integer("last_effective_at"),
  lastMessage: text("last_message"),
  lastStatus: integer("last_status").notNull().default(0),
  lastSyncedAt: text("last_synced_at").default(sql`(CURRENT_TIMESTAMP)`),
  totalEvaluated: integer("total_evaluated").notNull().default(0),
});
export type Fuel = typeof fuels.$inferSelect;
export type Region = typeof regions.$inferSelect;
