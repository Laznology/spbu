import { createSelectSchema } from "drizzle-orm/valibot";
import * as v from "valibot";
import { fuels } from "../db/schema";

export const FuelSchema = createSelectSchema(fuels, {
  id: v.pipe(v.string(), v.metadata({ example: "pertamax" })),
  isSubsidized: v.pipe(v.boolean(), v.metadata({ example: false })),
  name: v.pipe(v.string(), v.metadata({ example: "PERTAMAX" })),
  providerId: v.pipe(v.string(), v.metadata({ example: "pertamina" })),
});

export const FuelParamsSchema = v.object({
  id: v.pipe(v.string(), v.metadata({ example: "pertamax" })),
});

export const FuelResponseSchema = v.object({
  data: FuelSchema,
  success: v.pipe(v.boolean(), v.metadata({ example: true })),
});

export const FuelsResponseSchema = v.object({
  data: v.array(FuelSchema),
  success: v.pipe(v.boolean(), v.metadata({ example: true })),
});
