import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./server",
  experimental: {
    openAPI: true,
  },
  openAPI: {
    ui: {
      scalar: {
        route: "/docs",
      },
    },
  },
});
