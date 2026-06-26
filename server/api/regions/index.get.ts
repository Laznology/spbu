import { regionService } from "#server/services/region.service.ts";
import { defineEventHandler } from "h3";
import { defineRouteMeta } from "nitro";

defineRouteMeta({
  openAPI: {
    tags: ["open"],
  },
});

export default defineEventHandler(async () => {
  return await regionService.list();
});
