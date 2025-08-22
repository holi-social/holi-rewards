import { drizzle } from "drizzle-orm/node-postgres";
import { requireEnv } from "../utils.ts";
import {
  externalCounterValue as externalCounterValueSchema,
  transaction as transactionSchema,
  unlockedBadge as unlockedBadgeSchema,
} from "./schema.ts";

const getDbUrl = () => {
  const [host, port, database, user, password] = [
    requireEnv("DB_HOST"),
    parseInt(Deno.env.get("DB_PORT") ?? "5432"),
    requireEnv("DB_NAME"),
    requireEnv("DB_USER"),
    requireEnv("DB_PASSWORD"),
  ];

  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
};

export const createDbConnection = () =>
  drizzle(getDbUrl(), {
    schema: {
      transactions: transactionSchema,
      externalCounterValues: externalCounterValueSchema,
      unlockedBadges: unlockedBadgeSchema,
    },
  });

export type DbConnection = ReturnType<typeof createDbConnection>;
