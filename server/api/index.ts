import { defineHandler } from "nitro";
import { defineRouteMeta } from "nitro";

defineRouteMeta({
  openAPI: {
    tags: ["open"],
  },
});

export default defineHandler(() => {
  return { message: "Hello from API!" };
});
