import { createSelectSchema } from "drizzle-orm/valibot";
import * as v from "valibot";
import { fuelPriceHistory } from "../db/schema";
import { FuelSchema } from "./fuel";

export const FuelPriceHistorySchema = createSelectSchema(fuelPriceHistory, {
  effectiveAt: v.pipe(
    v.number(),
    v.minValue(0),
    v.metadata({ example: 1_788_307_260_000 })
  ),
  fuelId: v.pipe(v.string(), v.metadata({ example: "pertamax" })),
  id: v.pipe(v.number(), v.minValue(1), v.metadata({ example: 147 })),
  price: v.pipe(v.number(), v.minValue(0), v.metadata({ example: 15_950 })),
  regionId: v.pipe(v.string(), v.metadata({ example: "di-yogyakarta" })),
});

export const PriceRecordSchema = v.object({
  effectiveAt: FuelPriceHistorySchema.entries.effectiveAt,
  fuelId: FuelPriceHistorySchema.entries.fuelId,
  fuelName: FuelSchema.entries.name,
  id: FuelPriceHistorySchema.entries.id,
  isSubsidized: FuelSchema.entries.isSubsidized,
  price: FuelPriceHistorySchema.entries.price,
  regionId: FuelPriceHistorySchema.entries.regionId,
});

export const PricesResponseSchema = v.object({
  count: v.pipe(v.number(), v.metadata({ example: 1 })),
  data: v.array(PriceRecordSchema),
  success: v.pipe(v.boolean(), v.metadata({ example: true })),
});

export const LatestPriceQuerySchema = v.object({
  fuelId: v.optional(v.string()),
  regionId: v.optional(v.string()),
});

export const PriceHistoryQuerySchema = v.object({
  fuelId: v.optional(v.pipe(v.string(), v.metadata({ example: "pertamax" }))),
  limit: v.optional(
    v.pipe(
      v.string(),
      v.transform((val) => Number.parseInt(val, 10)),
      v.minValue(1),
      v.maxValue(100),
      v.metadata({ example: "50" })
    ),
    "50"
  ),
  regionId: v.optional(
    v.pipe(v.string(), v.metadata({ example: "di-yogyakarta" }))
  ),
  subsidizedOnly: v.optional(
    v.pipe(
      v.string(),
      v.transform((val) => val === "true"),
      v.metadata({ example: "false" })
    )
  ),
});
