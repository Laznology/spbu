import z from "zod";

export const regionIdParamScehma = z.object({
  regionId: z.uuidv7(),
});

export type regionIdType = z.infer<typeof regionIdParamScehma>;
