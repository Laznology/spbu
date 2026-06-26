import { db } from "#server/db/client.ts";
import { region } from "#server/db/schema.ts";
import { HTTPError } from "h3";

class RegionService {
  private readonly database: typeof db;
  constructor(database: typeof db) {
    this.database = database;
  }

  async list() {
    try {
      const regions = this.database.select({ id: region.id, name: region.name }).from(region).all();
      return regions;
    } catch (error: any) {
      if (error instanceof HTTPError) throw error;
      throw new HTTPError({ statusCode: 500, message: "INTERNAL SERVER ERROR" });
    }
  }
}

export const regionService = new RegionService(db);
