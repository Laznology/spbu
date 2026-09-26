import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { sqlite } from "../db/client";

export const backupRoutes = new Hono().get(
  "/",
  describeRoute({
    summary: "Download Database Backup",
    description: "Downloads a consistent SQLite database backup.",
    tags: ["Backup"],
    security: [{ ApiKeyAuth: [] }],
    responses: {
      200: {
        description: "SQLite database backup file",
        content: {
          "application/octet-stream": {
            schema: {
              type: "string",
              format: "binary",
            },
          },
        },
      },
      401: {
        description: "Unauthorized - API key required or invalid",
      },
      500: {
        description: "Failed to create database backup",
      },
    },
  }),
  (c) => {
    const filename = `backup-${new Date()
      .toISOString()
      .replaceAll(":", "-")}.db`;

    return new Response(sqlite.serialize(), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }
);
