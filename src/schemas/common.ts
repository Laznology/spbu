import * as v from "valibot";

export const ErrorResponseSchema = v.object({
  error: v.pipe(v.string(), v.metadata({ example: "Not found" })),
  success: v.pipe(v.boolean(), v.metadata({ example: false })),
});
