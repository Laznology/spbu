import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { number, object, optional, string } from "valibot";
import { apiKeyAuth } from "../middleware/api-key";
import { executePriceSync } from "../utils/pertamina";

const syncResponse = object({
  message: optional(string()),
  synced: number(),
  totalEvaluated: optional(number()),
});

export const syncRoutes = new Hono().use(apiKeyAuth()).post(
  "/pertamina",
  describeRoute({
    description:
      "Fetches upstream fuel prices, normalizes the data, and logs price change histories.",
    responses: {
      200: {
        content: {
          "application/json": {
            example: {
              synced: 360,
              totalEvaluated: 360,
            },
            schema: resolver(syncResponse),
          },
        },
        description: "Synchronization succeeded",
      },
      401: {
        description: "Unauthorized - API key required or invalid",
      },
    },
    security: [{ ApiKeyAuth: [] }],
    summary: "Trigger Pertamina Price Synchronization",
    tags: ["Sync"],
  }),
  async (c) => {
    const result = await executePriceSync();
    return c.json(result);
  }
);
