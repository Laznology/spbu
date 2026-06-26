import { priceQueryScehma } from "#server/models/fuel.model.ts";
import { fuelService } from "#server/services/fuel.service.ts";
import { defineEventHandler, getValidatedQuery } from "h3";
import { defineRouteMeta } from "nitro";

defineRouteMeta({
  openAPI: {
    tags: ["open"],
  },
});

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (data) => priceQueryScehma.parse(data));
  return await fuelService.priceList(query);
});
