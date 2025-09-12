import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import type { DbConnection } from "../../src/db/connection.ts";
import * as schema from "../../src/db/schema.ts";

export const createInMemoryDatabase = async () => await PGlite.create();

const createDrizzleConnection = (client: PGlite) =>
  drizzle({
    client,
    schema: {
      ...schema,
      transactions: schema.transaction,
      externalCounterValues: schema.externalCounterValue,
      unlockedBadges: schema.unlockedBadge,
    },
  }) as unknown as DbConnection;

export const resetDb = async (drizzleClient: DbConnection) => {
  await drizzleClient.execute("DROP SCHEMA IF EXISTS public CASCADE;");
  await drizzleClient.execute("CREATE SCHEMA public;");

  // this is a weird workaround because just importing from drizzle-kit doesn't work
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);

  const { pushSchema } = require("drizzle-kit/api") as typeof import("drizzle-kit/api");

  // @ts-expect-error drizzle types don't like the switch to pglite
  const { apply } = await pushSchema(schema, drizzleClient);
  await apply();
};

export const createTestDb = async () => {
  const client = await createInMemoryDatabase();
  return createDrizzleConnection(client);
};

export type TestDbConnection = Awaited<ReturnType<typeof createTestDb>>;
