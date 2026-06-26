import { db } from "#server/db/client.ts";
import { provider } from "#server/db/schema.ts";
import { HTTPError } from "h3";

class ProviderService {
  private readonly database: typeof db;
  constructor(database: typeof db) {
    this.database = database;
  }

  async list() {
    try {
      const providers = this.database
        .select({ id: provider.id, name: provider.name })
        .from(provider)
        .all();
      return providers;
    } catch (error: any) {
      if (error instanceof HTTPError) throw error;
      throw new HTTPError({ statusCode: 500, message: "INTERNAL SERVER ERROR" });
    }
  }
}

export const providerService = new ProviderService(db);
