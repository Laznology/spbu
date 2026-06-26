import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * @description
 * Stores fuel provider companies.
 */
export const provider = sqliteTable(
  "providers",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    nameIdx: index("provider_name_idx").on(t.name),
  }),
);

/**
 * @description
 * Stores region or province data.
 * Used to determine specific fuel prices and regional policies (e.g., Free Trade Zones).
 */
export const region = sqliteTable(
  "regions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Bun.randomUUIDv7()),
    name: text("name").notNull(),
    isFtz: integer("is_ftz", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    nameIdx: index("region_name_idx").on(t.name),
  }),
);

/**
 * @description
 * Stores fuel types (e.g., Pertamax, Shell Super) and links them to their provider.
 */
export const fuel = sqliteTable(
  "fuels",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Bun.randomUUIDv7()),
    name: text("name").notNull(),
    providerId: text("provider_id")
      .references(() => provider.id)
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    providerIdIdx: index("fuel_provider_id_idx").on(t.providerId),
    nameIdx: index("fuel_name_idx").on(t.name),
  }),
);

/**
 * @description
 * Stores the price of a specific fuel in a specific region/province.
 */
export const fuelPrice = sqliteTable(
  "fuel_prices",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Bun.randomUUIDv7()),
    fuelId: text("fuel_id")
      .references(() => fuel.id)
      .notNull(),
    regionId: text("region_id")
      .references(() => region.id)
      .notNull(),
    price: integer("price").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    fuelIdIdx: index("fuel_price_fuel_id_idx").on(t.fuelId),
    regionIdIdx: index("fuel_price_region_id_idx").on(t.regionId),
    fuelRegionUnq: uniqueIndex("fuel_region_unq_idx").on(t.fuelId, t.regionId),
  }),
);

/**
 * @description
 * Stores historical prices of a specific fuel in a specific region/province.
 */
export const fuelPriceHistory = sqliteTable(
  "fuel_price_history",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Bun.randomUUIDv7()),
    fuelId: text("fuel_id")
      .references(() => fuel.id)
      .notNull(),
    regionId: text("region_id")
      .references(() => region.id)
      .notNull(),
    price: integer("price").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    fuelIdIdx: index("fuel_price_history_fuel_id_idx").on(t.fuelId),
    regionIdIdx: index("fuel_price_history_region_id_idx").on(t.regionId),
  }),
);
