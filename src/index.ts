import { Scalar } from "@scalar/hono-api-reference";
import { toJsonSchema } from "@valibot/to-json-schema";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { openAPIRouteHandler } from "hono-openapi";
import { apiKeyAuth } from "./middleware/api-key";
import { fuelRoutes } from "./routes/fuels";
import { priceRoutes } from "./routes/prices";
import { regionRoutes } from "./routes/regions";
import { syncRoutes } from "./routes/sync";
import {
  ErrorResponseSchema,
  FuelPriceHistorySchema,
  FuelResponseSchema,
  FuelSchema,
  FuelsResponseSchema,
  PriceRecordSchema,
  PricesResponseSchema,
  RegionResponseSchema,
  RegionSchema,
  RegionsResponseSchema,
} from "./schemas";

function toModel(schema: Parameters<typeof toJsonSchema>[0]) {
  const { $schema: _, ...clean } = toJsonSchema(schema);
  return clean as never;
}

const app = new Hono();

app.use("*", logger());
app.use("/api/*", apiKeyAuth());

const routes = app
  .basePath("/api")
  .route("/sync", syncRoutes)
  .route("/fuels", fuelRoutes)
  .route("/prices", priceRoutes)
  .route("/regions", regionRoutes);

app.get(
  "/openapi",
  openAPIRouteHandler(app, {
    documentation: {
      components: {
        schemas: {
          ErrorResponse: toModel(ErrorResponseSchema),
          Fuel: toModel(FuelSchema),
          FuelPriceHistory: toModel(FuelPriceHistorySchema),
          FuelResponse: toModel(FuelResponseSchema),
          FuelsResponse: toModel(FuelsResponseSchema),
          PriceRecord: toModel(PriceRecordSchema),
          PricesResponse: toModel(PricesResponseSchema),
          Region: toModel(RegionSchema),
          RegionResponse: toModel(RegionResponseSchema),
          RegionsResponse: toModel(RegionsResponseSchema),
        },
        securitySchemes: {
          ApiKeyAuth: {
            description: "API key header authentication",
            in: "header",
            name: "x-api-key",
            type: "apiKey",
          },
        },
      },
      info: {
        description:
          "High-performance modular fuel price historical tracking service.",
        title: "Pertamina Fuel Price API",
        version: "1.0.0",
      },
      security: [
        {
          ApiKeyAuth: [],
        },
      ],
    },
  })
);

app.get(
  "/docs",
  Scalar({
    authentication: {
      preferredSecurityScheme: "ApiKeyAuth",
    },
    url: "/openapi",
  })
);

const port = Number(process.env.PORT) || 5000;

export type AppType = typeof routes;
export default {
  fetch: app.fetch,
  port,
};
