import { providerService } from "#server/services/provider.service.ts";
import { defineEventHandler } from "h3";
import { defineRouteMeta } from "nitro";

defineRouteMeta({
  openAPI: {
    tags: ["open"],
  },
});

export default defineEventHandler(async (event) => {
  const data = await providerService.list();
  if (!data) {
    event.res.status = 404;
    event.res.statusText = "Not Found";
  }
  return {
    success: true,
    data,
  };
});
