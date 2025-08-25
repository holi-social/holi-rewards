import { assertEquals } from "@std/assert";
import { ExternalCounterValueRepository } from "../../../src/db/repository/externalCounter.ts";
import { externalCounterValue } from "../../../src/db/schema.ts";
import { createTestDb, resetDb } from "../helpers.ts";

const db = await createTestDb();
Deno.test.beforeEach(async () => await resetDb(db));

const repo = new ExternalCounterValueRepository(db);

Deno.test("should get correct value", async () => {
  await db.insert(externalCounterValue).values([
    {
      createdAt: Temporal.Now.zonedDateTimeISO("UTC").subtract({ days: 2 }),
      externalCount: 100,
    },
    {
      createdAt: Temporal.Now.zonedDateTimeISO("UTC").subtract({ days: 1 }),
      externalCount: 200,
    },
  ]);

  const latest = await repo.getLatestValue();
  assertEquals(latest, 200);
});
