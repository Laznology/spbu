import z from "zod";

export const priceQueryScehma = z.object({
  regionId: z.uuidv7().optional(),
  providerId: z.string().optional(),
  fuelId: z.uuidv7().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const fuelIdParamScehma = z.object({
  fuelId: z.uuidv7(),
});

export type fuelIdType = z.infer<typeof fuelIdParamScehma>;
export type priceListRequest = z.infer<typeof priceQueryScehma>;
