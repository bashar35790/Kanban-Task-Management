import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // DIRECT_URL (session pooler :5432) is preferred for migrations.
    // Fall back to DATABASE_URL so `migrate deploy` still works if only
    // one var is set on the host (e.g. Render). `env()` from
    // prisma/config throws when the var is missing, so use process.env
    // here to allow the fallback.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
