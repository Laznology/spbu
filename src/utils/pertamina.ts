import { sql } from "drizzle-orm";
import { db } from "../db/client";
import { fuelPriceHistory, fuels, regions } from "../db/schema";
import type { PertaminaApiResponse } from "../types/pertamina";
import { isFtz, isSubsidizedFuel, normalizePrice, toSlug } from "./helper";

const PROVINCE_PREFIX = /^Prov\.\s*/i;

export async function executePriceSync() {
  const response = await fetch("https://api.web.mypertamina.id/price", {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(
      `Upstream API failed: ${response.status} ${response.statusText}`
    );
  }
  const payload = (await response.json()) as PertaminaApiResponse;
  const rawProvinces = payload.data?.data ?? [];
  if (!rawProvinces.length) {
    return { message: "No data available from upstream", synced: 0 };
  }
  const providerId = "pertamina";
  const uniqueRegions = new Map<
    string,
    { id: string; name: string; isFtz: boolean }
  >();
  const uniqueFuels = new Map<
    string,
    { id: string; name: string; providerId: string; isSubsidized: boolean }
  >();
  const flattenedRows = rawProvinces.flatMap((prov) => {
    const rawName = prov.province.replace(PROVINCE_PREFIX, "").trim();
    const regionId = toSlug(rawName);
    if (!uniqueRegions.has(regionId)) {
      uniqueRegions.set(regionId, {
        id: regionId,
        isFtz: isFtz(rawName),
        name: rawName,
      });
    }
    return prov.list_price.map((item) => {
      const fuelName = item.product.trim();
      const fuelId = toSlug(fuelName);
      if (!uniqueFuels.has(fuelId)) {
        uniqueFuels.set(fuelId, {
          id: fuelId,
          isSubsidized: isSubsidizedFuel(fuelName),
          name: fuelName,
          providerId,
        });
      }
      return {
        effectiveAt: Date.parse(item.updatedDate),
        fuelId,
        price: normalizePrice(item.price),
        regionId,
      };
    });
  });

  return db.transaction((tx) => {
    tx.insert(regions)
      .values([...uniqueRegions.values()])
      .onConflictDoNothing()
      .run();
    tx.insert(fuels)
      .values([...uniqueFuels.values()])
      .onConflictDoUpdate({
        set: {
          isSubsidized: sql`excluded.is_subsidized`,
        },
        target: fuels.id,
      })
      .run();
    const latestStored = tx
      .select({
        fuelId: fuelPriceHistory.fuelId,
        price: fuelPriceHistory.price,
        regionId: fuelPriceHistory.regionId,
      })
      .from(fuelPriceHistory)
      .where(
        sql`id IN (SELECT MAX(id) FROM ${fuelPriceHistory} GROUP BY fuel_id, region_id)`
      )
      .all();
    const latestPriceMap = new Map(
      latestStored.map((p) => [`${p.fuelId}-${p.regionId}`, p.price])
    );
    const newRecords: (typeof flattenedRows)[number][] = [];
    for (const row of flattenedRows) {
      const key = `${row.fuelId}-${row.regionId}`;
      if (latestPriceMap.get(key) !== row.price) {
        newRecords.push(row);
        latestPriceMap.set(key, row.price);
      }
    }
    if (newRecords.length > 0) {
      tx.insert(fuelPriceHistory)
        .values(newRecords)
        .onConflictDoNothing()
        .run();
    }
    return { synced: newRecords.length, totalEvaluated: flattenedRows.length };
  });
}
