import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/kanban?schema=public";

if (!process.env.DATABASE_URL) {

  console.warn(
    "[prisma] DATABASE_URL is not set, falling back to local default. " +
      "Set it to the Supabase transaction pooler URL (port 6543) for deployment."
  );
}

const needsSSL =
  connectionString.includes("supabase.com") ||
  connectionString.includes("sslmode=require") ||
  process.env.NODE_ENV === "production";

const pool = needsSSL
  ? new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  : new pg.Pool({ connectionString });

export const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});
