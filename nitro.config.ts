import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./server",
  preset: "bun",
  experimental: {
    openAPI: true,
    tasks: true,
  },
  openAPI: {
    ui: {
      scalar: {
        route: "/docs",
      },
    },
  },
});
