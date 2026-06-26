import { fuelService } from "#server/services/fuel.service.ts";
import { defineEventHandler } from "h3";
import { defineRouteMeta } from "nitro";

defineRouteMeta({
  openAPI: {
    tags: ["open"],
  },
});

export default defineEventHandler(async () => {
  return await fuelService.list();
});
