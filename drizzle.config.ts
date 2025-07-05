import { defineConfig } from "drizzle-kit";
import { requireEnv } from "./src/utils.ts";

export default defineConfig({
  out: "./migrations",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: requireEnv("DB_HOST"),
    port: Deno.env.has("DB_PORT") ? parseInt(Deno.env.get("DB_PORT")!) : 5432,
    database: requireEnv("DB_NAME"),
    user: requireEnv("DB_USER"),
    password: requireEnv("DB_PASSWORD"),
    ssl: false,
  },
});
