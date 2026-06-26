import { consola } from "consola";
import { db } from "#server/db/client.ts";
import { provider } from "#server/db/schema.ts";

export default {
  meta: {
    name: "db:seed",
    description: "Seeding data master provider ke database",
  },
  async run() {
    const providerData = [
      { id: "pertamina", name: "Pertamina (Persero)" },
      { id: "shell", name: "Shell" },
      { id: "bp", name: "BP" },
    ];

    try {
      consola.start("Nitro Task: Memulai seeding provider...");

      await db.insert(provider).values(providerData).onConflictDoNothing();

      consola.success("Nitro Task: Seeding provider sukses! ");
      return { result: "Success" };
    } catch (error) {
      consola.error("Nitro Task: Gagal seeding provider:", error);
      return { result: "Error", message: String(error) };
    }
  },
};
