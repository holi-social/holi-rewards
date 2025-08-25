import { assert, assertFalse } from "@std/assert";
import { assertEquals } from "@std/assert/equals";
import { repeatedActionBadge } from "../../src/badges/helpers.ts";
import { transaction } from "../../src/db/schema.ts";
import { RewardType } from "../../src/types.ts";
import { createTestDb, resetDb } from "../db/helpers.ts";
import { randomTimestampInLastWeek } from "../helpers.ts";

const db = await createTestDb();
Deno.test.beforeEach(async () => await resetDb(db));

const userId = crypto.randomUUID();

Deno.test("repeatedActionBadge should count progress correctly", async () => {
  await db.insert(transaction).values([
    { userId, rewardType: RewardType.TASK_COMPLETED, createdAt: randomTimestampInLastWeek() },
    { userId, rewardType: RewardType.TASK_COMPLETED, createdAt: randomTimestampInLastWeek() },
    { userId, rewardType: RewardType.TASK_COMPLETED, createdAt: randomTimestampInLastWeek() },
  ]);

  const badge = repeatedActionBadge("test-badge", RewardType.TASK_COMPLETED, 5);

  const progressMade = await badge.progressMade(userId, db);
  assertEquals(progressMade, 3);
});

Deno.test("repeatedActionBadge should correctly determine eligibility", async () => {
  await db.insert(transaction).values([
    { userId, rewardType: RewardType.TASK_COMPLETED, createdAt: randomTimestampInLastWeek() },
    { userId, rewardType: RewardType.TASK_COMPLETED, createdAt: randomTimestampInLastWeek() },
    { userId, rewardType: RewardType.TASK_COMPLETED, createdAt: randomTimestampInLastWeek() },
  ]);

  const badge = repeatedActionBadge("test-badge", RewardType.TASK_COMPLETED, 5);

  assertFalse(await badge.userIsEligible(userId, db), "user should not be eligible yet");

  await db.insert(transaction).values([
    { userId, rewardType: RewardType.TASK_COMPLETED, createdAt: randomTimestampInLastWeek() },
    { userId, rewardType: RewardType.TASK_COMPLETED, createdAt: randomTimestampInLastWeek() },
  ]);

  assert(await badge.userIsEligible(userId, db), "user should now be exactly eligible");

  await db.insert(transaction).values([
    { userId, rewardType: RewardType.TASK_COMPLETED, createdAt: randomTimestampInLastWeek() },
    { userId, rewardType: RewardType.TASK_COMPLETED, createdAt: randomTimestampInLastWeek() },
  ]);

  assert(await badge.userIsEligible(userId, db), "user should still be eligible");
});
