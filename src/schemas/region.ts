import { createSelectSchema } from "drizzle-orm/valibot";
import * as v from "valibot";
import { regions } from "../db/schema";

export const RegionSchema = createSelectSchema(regions, {
  id: v.pipe(v.string(), v.metadata({ example: "di-yogyakarta" })),
  isFtz: v.pipe(v.boolean(), v.metadata({ example: false })),
  name: v.pipe(v.string(), v.metadata({ example: "DI Yogyakarta" })),
});

export const RegionParamsSchema = v.object({
  id: v.pipe(v.string(), v.metadata({ example: "di-yogyakarta" })),
});

export const RegionResponseSchema = v.object({
  data: RegionSchema,
  success: v.pipe(v.boolean(), v.metadata({ example: true })),
});

export const RegionsResponseSchema = v.object({
  data: v.array(RegionSchema),
  success: v.pipe(v.boolean(), v.metadata({ example: true })),
});
