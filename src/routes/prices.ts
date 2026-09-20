import { vValidator } from "@hono/valibot-validator";
import { and, desc, eq, type SQL, sql } from "drizzle-orm";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { db } from "../db/client";
import { fuelPriceHistory, fuels } from "../db/schema";
import {
  LatestPriceQuerySchema,
  PriceHistoryQuerySchema,
  PricesResponseSchema,
} from "../schemas";

export const priceRoutes = new Hono()
  .get(
    "/",
    describeRoute({
      description:
        "Returns historical price snapshots filtered by region, fuel, or subsidy flag.",
      parameters: [
        {
          in: "query",
          name: "fuelId",
          schema: { example: "pertamax", type: "string" },
        },
        {
          in: "query",
          name: "limit",
          schema: { default: "50", example: "50", type: "string" },
        },
        {
          in: "query",
          name: "regionId",
          schema: { example: "di-yogyakarta", type: "string" },
        },
        {
          in: "query",
          name: "subsidizedOnly",
          schema: { example: "false", type: "string" },
        },
      ],
      responses: {
        200: {
          content: {
            "application/json": {
              example: {
                count: 1,
                data: [
                  {
                    effectiveAt: 1_788_307_260_000,
                    fuelId: "pertamax",
                    fuelName: "PERTAMAX",
                    id: 147,
                    isSubsidized: false,
                    price: 15_950,
                    regionId: "di-yogyakarta",
                  },
                ],
                success: true,
              },
              schema: resolver(PricesResponseSchema),
            },
          },
          description: "Price history records retrieved successfully",
        },
        401: {
          description: "Unauthorized - API key required or invalid",
        },
      },
      summary: "Retrieve Fuel Price History",
      tags: ["Prices"],
    }),
    vValidator("query", PriceHistoryQuerySchema),
    async (c) => {
      const { fuelId, limit, regionId, subsidizedOnly } = c.req.valid("query");
      const conditions: SQL[] = [];
      if (regionId) {
        conditions.push(eq(fuelPriceHistory.regionId, regionId));
      }
      if (fuelId) {
        conditions.push(eq(fuelPriceHistory.fuelId, fuelId));
      }
      if (subsidizedOnly !== undefined) {
        conditions.push(eq(fuels.isSubsidized, subsidizedOnly));
      }

      const records = await db
        .select({
          effectiveAt: fuelPriceHistory.effectiveAt,
          fuelId: fuelPriceHistory.fuelId,
          fuelName: fuels.name,
          id: fuelPriceHistory.id,
          isSubsidized: fuels.isSubsidized,
          price: fuelPriceHistory.price,
          regionId: fuelPriceHistory.regionId,
        })
        .from(fuelPriceHistory)
        .innerJoin(fuels, eq(fuelPriceHistory.fuelId, fuels.id))
        .where(conditions.length ? and(...conditions) : undefined)
        .limit(limit)
        .orderBy(desc(fuelPriceHistory.id));

      return c.json({ count: records.length, data: records, success: true });
    }
  )
  .get(
    "/latest",
    describeRoute({
      description:
        "Returns the most recent price snapshot for each fuel per region.",
      responses: {
        200: {
          content: {
            "application/json": {
              example: {
                count: 1,
                data: [
                  {
                    effectiveAt: 1_788_307_260_000,
                    fuelId: "pertamax",
                    fuelName: "PERTAMAX",
                    id: 147,
                    isSubsidized: false,
                    price: 15_950,
                    regionId: "di-yogyakarta",
                  },
                ],
                success: true,
              },
              schema: resolver(PricesResponseSchema),
            },
          },
          description: "Latest prices retrieved successfully",
        },
      },
      summary: "Get Latest Fuel Prices",
      tags: ["Prices"],
    }),
    vValidator("query", LatestPriceQuerySchema),
    async (c) => {
      const { fuelId, regionId } = c.req.valid("query");
      const conditions: SQL[] = [
        sql`${fuelPriceHistory.id} IN (SELECT MAX(id) FROM ${fuelPriceHistory} GROUP BY fuel_id, region_id)`,
      ];
      if (regionId) {
        conditions.push(eq(fuelPriceHistory.regionId, regionId));
      }
      if (fuelId) {
        conditions.push(eq(fuelPriceHistory.fuelId, fuelId));
      }

      const records = await db
        .select({
          effectiveAt: fuelPriceHistory.effectiveAt,
          fuelId: fuelPriceHistory.fuelId,
          fuelName: fuels.name,
          id: fuelPriceHistory.id,
          isSubsidized: fuels.isSubsidized,
          price: fuelPriceHistory.price,
          regionId: fuelPriceHistory.regionId,
        })
        .from(fuelPriceHistory)
        .innerJoin(fuels, eq(fuelPriceHistory.fuelId, fuels.id))
        .where(and(...conditions))
        .orderBy(desc(fuelPriceHistory.id));
      return c.json({ count: records.length, data: records, success: true });
    }
  );
