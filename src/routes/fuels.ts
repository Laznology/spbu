import { vValidator } from "@hono/valibot-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { db } from "../db/client";
import { fuels } from "../db/schema";
import {
  ErrorResponseSchema,
  FuelParamsSchema,
  FuelResponseSchema,
  FuelsResponseSchema,
} from "../schemas";

export const fuelRoutes = new Hono()
  .get(
    "/",
    describeRoute({
      description: "Retrieves all indexed fuels and subsidy statuses.",
      responses: {
        200: {
          content: {
            "application/json": {
              example: {
                data: [
                  {
                    id: "pertamax",
                    isSubsidized: false,
                    name: "PERTAMAX",
                    providerId: "pertamina",
                  },
                ],
                success: true,
              },
              schema: resolver(FuelsResponseSchema),
            },
          },
          description: "All fuels retrieved successfully",
        },
        401: {
          description: "Unauthorized - API key required or invalid",
        },
      },
      summary: "List fuels",
      tags: ["Fuels"],
    }),
    async (c) => {
      const allFuels = await db.select().from(fuels);
      return c.json({ data: allFuels, success: true });
    }
  )
  .get(
    "/:id",
    describeRoute({
      description:
        "Retrieves fuel information for a specific identifier (e.g. 'pertamax').",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { example: "pertamax", type: "string" },
        },
      ],
      responses: {
        200: {
          content: {
            "application/json": {
              example: {
                data: {
                  id: "pertamax",
                  isSubsidized: false,
                  name: "PERTAMAX",
                  providerId: "pertamina",
                },
                success: true,
              },
              schema: resolver(FuelResponseSchema),
            },
          },
          description: "Fuel details retrieved successfully",
        },
        401: {
          description: "Unauthorized - API key required or invalid",
        },
        404: {
          content: {
            "application/json": {
              example: {
                error: "Fuel not found",
                success: false,
              },
              schema: resolver(ErrorResponseSchema),
            },
          },
          description: "Fuel not found",
        },
      },
      summary: "Get Fuel by Slug ID",
      tags: ["Fuels"],
    }),
    vValidator("param", FuelParamsSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const [fuelItem] = await db.select().from(fuels).where(eq(fuels.id, id));

      if (!fuelItem) {
        return c.json({ error: "Fuel not found", success: false }, 404);
      }

      return c.json({ data: fuelItem, success: true });
    }
  );
