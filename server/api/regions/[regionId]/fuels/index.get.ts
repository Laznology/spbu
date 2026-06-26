import { regionIdParamScehma } from "#server/models/region.model.ts";
import { fuelService } from "#server/services/fuel.service.ts";
import { defineEventHandler, getValidatedRouterParams } from "h3";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, (data) => regionIdParamScehma.parse(data));
  return {
    success: true,
    data: await fuelService.getByRegion(params),
  };
});
