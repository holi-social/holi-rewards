import { assertEquals } from "@std/assert";
import { firstTimeBadge, repeatedActionBadge } from "../../src/badges/helpers.ts";
import { BadgesService } from "../../src/badges/index.ts";
import { UnlockedBadgeRepository } from "../../src/db/repository/unlockedBadge.ts";
import { transaction } from "../../src/db/schema.ts";
import { RewardType } from "../../src/types.ts";
import { createTestDb, resetDb } from "../db/helpers.ts";
import { randomTimestampInLastWeek } from "../helpers.ts";

const db = await createTestDb();
Deno.test.beforeEach(async () => await resetDb(db));

const userId = crypto.randomUUID();
const repo = new UnlockedBadgeRepository(db);
const badgeConfig = [
  firstTimeBadge("first-time", [RewardType.TASK_COMPLETED]),
  repeatedActionBadge("fifth-time", [RewardType.TASK_COMPLETED], 5),
];

const service = new BadgesService(repo, db, badgeConfig);

Deno.test("should unlock badges correctly", async () => {
  await db
    .insert(transaction)
    .values([{ userId, rewardType: RewardType.TASK_COMPLETED, createdAt: randomTimestampInLastWeek() }]);
  await service.unlockNewBadgesForUser(userId);

  const unlocked = await service.getUnlockedBadgesForUser(userId);
  assertEquals(unlocked.length, 1, "first-time badge should be unlocked");

  await db.insert(transaction).values([
    { userId, rewardType: RewardType.TASK_COMPLETED, createdAt: randomTimestampInLastWeek() },
    { userId, rewardType: RewardType.TASK_COMPLETED, createdAt: randomTimestampInLastWeek() },
    { userId, rewardType: RewardType.TASK_COMPLETED, createdAt: randomTimestampInLastWeek() },
    { userId, rewardType: RewardType.TASK_COMPLETED, createdAt: randomTimestampInLastWeek() },
  ]);
  await service.unlockNewBadgesForUser(userId);

  const allUnlocked = await service.getUnlockedBadgesForUser(userId);
  assertEquals(allUnlocked.length, 2, "fifth-time badge should be unlocked");
});
