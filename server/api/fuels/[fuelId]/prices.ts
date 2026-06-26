import { fuelService } from "#server/services/fuel.service.ts";
import { fuelIdParamScehma } from "#server/models/fuel.model.ts";
import { defineEventHandler, getValidatedRouterParams } from "h3";
import { defineRouteMeta } from "nitro";

defineRouteMeta({
  openAPI: {
    tags: ["open"],
  },
});

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, (data) => fuelIdParamScehma.parse(data));
  const data = await fuelService.getByFuelId(params);

  return {
    success: true,
    data,
  };
});
