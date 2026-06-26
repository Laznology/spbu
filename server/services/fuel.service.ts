import { db } from "#server/db/client.ts";
import { fuel, fuelPrice, fuelPriceHistory, provider, region } from "#server/db/schema.ts";
import type { fuelIdType, priceListRequest } from "#server/models/fuel.model.ts";
import type { regionIdType } from "#server/models/region.model.ts";
import { eq, SQL, and } from "drizzle-orm";
import { HTTPError } from "h3";

class FuelService {
  private readonly database: typeof db;
  constructor(database: typeof db) {
    this.database = database;
  }

  async list() {
    try {
      const fuels = await db.select().from(fuel);
      return fuels;
    } catch (error) {
      HTTPError.isError(error);
      throw new HTTPError({ statusCode: 500, message: "INTERNAL SERVER ERROR" });
    }
  }

  async priceList(query: priceListRequest) {
    try {
      const conditions: Array<SQL<unknown>> = [];
      if (query.regionId) conditions.push(eq(fuelPrice.regionId, query.regionId));
      if (query.providerId) conditions.push(eq(fuel.providerId, query.providerId));
      if (query.fuelId) conditions.push(eq(fuelPrice.fuelId, query.fuelId));

      const priceLists = await this.database
        .select({
          product: fuel.name,
          provider: provider.name,
          price: fuelPrice.price,
          updatedAt: fuelPrice.updatedAt,
          region: {
            name: region.name,
            isFtz: region.isFtz,
          },
        })
        .from(fuelPrice)
        .innerJoin(region, eq(fuelPrice.regionId, region.id))
        .innerJoin(fuel, eq(fuelPrice.fuelId, fuel.id))
        .innerJoin(provider, eq(fuel.providerId, provider.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .offset(query.offset)
        .limit(query.limit);
      return {
        data: priceLists,
        meta: {
          limit: query.limit,
          offset: query.offset,
          total: priceLists.length,
        },
      };
    } catch (error) {
      HTTPError.isError(error);
      throw new HTTPError({ statusCode: 500, message: "INTERNAL SERVER ERROR" });
    }
  }

  async getByFuelId(params: fuelIdType) {
    try {
      const [fuelData] = await this.database
        .select({ id: fuel.id })
        .from(fuel)
        .where(eq(fuel.id, params.fuelId))
        .limit(1);
      if (!fuelData)
        throw new HTTPError({
          statusCode: 404,
          message: `fuel with id ${params.fuelId} not found`,
        });
      const prices = await this.database
        .select({
          product: fuel.name,
          provider: provider.name,
          price: fuelPrice.price,
          updatedAt: fuelPrice.updatedAt,
          region: {
            name: region.name,
            isFtz: region.isFtz,
          },
        })
        .from(fuelPrice)
        .innerJoin(region, eq(fuelPrice.regionId, region.id))
        .innerJoin(fuel, eq(fuelPrice.fuelId, fuel.id))
        .innerJoin(provider, eq(fuel.providerId, provider.id))
        .where(eq(fuelPrice.fuelId, params.fuelId))
        .orderBy(region.name);
      return prices;
    } catch (error) {
      HTTPError.isError(error);
      throw new HTTPError({ statusCode: 500, message: "INTERNAL SERVER ERROR" });
    }
  }

  async getByRegion(params: regionIdType) {
    try {
      const [regionData] = await this.database
        .select({ id: region.id })
        .from(region)
        .where(eq(region.id, params.regionId))
        .limit(1);
      if (!regionData)
        throw new HTTPError({
          statusCode: 404,
          message: `fuel with id ${params.regionId} not found`,
        });
      const fuels = await this.database
        .select({
          product: fuel.name,
          provider: provider.name,
          price: fuelPrice.price,
          region: region.name,
          updatedAt: fuelPrice.updatedAt,
        })
        .from(fuelPrice)
        .innerJoin(region, eq(fuelPrice.regionId, region.id))
        .innerJoin(fuel, eq(fuelPrice.fuelId, fuel.id))
        .innerJoin(provider, eq(fuel.providerId, provider.id))
        .where(eq(fuelPrice.regionId, params.regionId))
        .orderBy(fuel.name);
      return fuels;
    } catch (error) {
      HTTPError.isError(error);
      throw new HTTPError({ statusCode: 500, message: "INTERNAL SERVER ERROR" });
    }
  }

  async getHistory(fuelId: string, regionId: string) {
    try {
      const history = await this.database
        .select({
          price: fuelPriceHistory.price,
          date: fuelPriceHistory.createdAt,
        })
        .from(fuelPriceHistory)
        .where(and(eq(fuelPriceHistory.fuelId, fuelId), eq(fuelPriceHistory.regionId, regionId)))
        .orderBy(fuelPriceHistory.createdAt);
      return history;
    } catch (error) {
      HTTPError.isError(error);
      throw new HTTPError({ statusCode: 500, message: "INTERNAL SERVER ERROR" });
    }
  }
}

export const fuelService = new FuelService(db);
