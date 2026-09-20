import { vValidator } from "@hono/valibot-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { db } from "../db/client";
import { regions } from "../db/schema";
import {
  ErrorResponseSchema,
  RegionParamsSchema,
  RegionResponseSchema,
  RegionsResponseSchema,
} from "../schemas";

export const regionRoutes = new Hono()
  .get(
    "/",
    describeRoute({
      description: "Retrieves all indexed regions.",
      responses: {
        200: {
          content: {
            "application/json": {
              example: {
                data: [
                  {
                    id: "di-yogyakarta",
                    isFtz: false,
                    name: "DI Yogyakarta",
                  },
                ],
                success: true,
              },
              schema: resolver(RegionsResponseSchema),
            },
          },
          description: "All regions retrieved successfully",
        },
        401: {
          description: "Unauthorized - API key required or invalid",
        },
      },
      summary: "Retrieve Provinces / Regions",
      tags: ["Regions"],
    }),
    async (c) => {
      const allRegions = await db.select().from(regions);
      return c.json({ data: allRegions, success: true });
    }
  )
  .get(
    "/:id",
    describeRoute({
      description: "Retrieves region information for a specific identifier.",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { example: "di-yogyakarta", type: "string" },
        },
      ],
      responses: {
        200: {
          content: {
            "application/json": {
              example: {
                data: {
                  id: "di-yogyakarta",
                  isFtz: false,
                  name: "DI Yogyakarta",
                },
                success: true,
              },
              schema: resolver(RegionResponseSchema),
            },
          },
          description: "Region details retrieved successfully",
        },
        401: {
          description: "Unauthorized - API key required or invalid",
        },
        404: {
          content: {
            "application/json": {
              example: {
                error: "Region not found",
                success: false,
              },
              schema: resolver(ErrorResponseSchema),
            },
          },
          description: "Region not found",
        },
      },
      summary: "Get Region by Slug ID",
      tags: ["Regions"],
    }),
    vValidator("param", RegionParamsSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const [regionItem] = await db
        .select()
        .from(regions)
        .where(eq(regions.id, id));

      if (!regionItem) {
        return c.json({ error: "Region not found", success: false }, 404);
      }

      return c.json({ data: regionItem, success: true });
    }
  );
