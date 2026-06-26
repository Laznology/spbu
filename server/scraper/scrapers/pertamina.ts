import { db } from "#server/db/client.ts";
import { fuel, fuelPrice, fuelPriceHistory, region } from "#server/db/schema.ts";
import { ofetch } from "ofetch";
import { normalizePrice } from "#server/utils/normalize-price.ts";
import { isFtz } from "#server/utils/is-ftz.ts";

interface Fuel {
  product: string;
  price: number;
  updatedDate: string;
}

interface PertaminaApiResponse {
  province: string;
  list_price: Fuel[];
}
const providerId = "pertamina";
const response = await ofetch("https://api.web.mypertamina.id/price");
const provinceArray = response.data.data as PertaminaApiResponse[];
const existingRegions = await db.select().from(region);
const regionMap = new Map(existingRegions.map((r) => [r.name.toLocaleLowerCase(), r.id]));
const existingFuels = await db.select().from(fuel);
const fuelMap = new Map(existingFuels.map((f) => [f.name.toLocaleLowerCase(), f.id]));
const existingPrices = await db.select().from(fuelPrice);
const priceMap = new Map(existingPrices.map((p) => [`${p.fuelId}-${p.regionId}`, p.price]));

for (const prov of provinceArray) {
  const regionName = prov.province.replace("Prov.", "").trim();
  const regionKey = regionName.toLocaleLowerCase();

  let currentRegionId = regionMap.get(regionKey);

  if (!currentRegionId) {
    const [newRegion] = await db
      .insert(region)
      .values({ name: regionName, isFtz: isFtz(regionName) })
      .returning();
    currentRegionId = newRegion.id;
    regionMap.set(regionKey, currentRegionId);
  }
  for (const item of prov.list_price) {
    const fuelName = item.product;
    const fuelKey = fuelName.toLocaleLowerCase();
    let currentFuelId = fuelMap.get(fuelKey);
    if (!currentFuelId) {
      const [newFuel] = await db.insert(fuel).values({ name: fuelName, providerId }).returning();
      currentFuelId = newFuel.id;
      fuelMap.set(fuelKey, currentFuelId);
    }
    const parsedPrice = normalizePrice(item.price);
    const existingPrice = priceMap.get(`${currentFuelId}-${currentRegionId}`);

    await db
      .insert(fuelPrice)
      .values({
        fuelId: currentFuelId,
        regionId: currentRegionId,
        price: parsedPrice,
      })
      .onConflictDoUpdate({
        target: [fuelPrice.fuelId, fuelPrice.regionId],
        set: { price: parsedPrice, updatedAt: new Date() },
      });

    if (existingPrice !== parsedPrice) {
      await db.insert(fuelPriceHistory).values({
        fuelId: currentFuelId,
        regionId: currentRegionId,
        price: parsedPrice,
      });
      priceMap.set(`${currentFuelId}-${currentRegionId}`, parsedPrice);
    }
  }
}
