import { assert, assertEquals, assertRejects } from "@std/assert";
import type { BadgeConfig } from "../../../src/badges/types.ts";
import { UnlockedBadgeRepository } from "../../../src/db/repository/unlockedBadge.ts";
import { createTestDb, resetDb } from "../helpers.ts";

const createMockBadge = (slug: string, progress: number = 100, goal: number = 100): BadgeConfig => ({
  slug,
  userIsEligible: () => Promise.resolve(progress >= goal),
  progressMade: () => Promise.resolve(progress),
  progressGoal: goal,
});

const db = await createTestDb();
Deno.test.beforeEach(async () => await resetDb(db));

const repo = new UnlockedBadgeRepository(db);
const testUserId = crypto.randomUUID();
const testBadge = createMockBadge("test-badge-1");

Deno.test("should unlock a badge for a user", async () => {
  const result = await repo.unlockBadge(testUserId, testBadge);

  assertEquals(result.userId, testUserId);
  assertEquals(result.badgeSlug, testBadge.slug);
  assertEquals(result.seenAt, null);
});

Deno.test("should return true for unlocked badge", async () => {
  await repo.unlockBadge(testUserId, testBadge);

  const isUnlocked = await repo.isBadgeUnlockedForUser(testUserId, testBadge);
  assertEquals(isUnlocked, true);
});

Deno.test("should return false for non-unlocked badge", async () => {
  const nonUnlockedBadge = createMockBadge("non-unlocked-badge");

  const isUnlocked = await repo.isBadgeUnlockedForUser(testUserId, nonUnlockedBadge);
  assertEquals(isUnlocked, false);
});

Deno.test("should return unlocked badges for user", async () => {
  await repo.unlockBadge(testUserId, testBadge);

  const unlockedBadges = await repo.badgesUnlockedByUser(testUserId);

  assertEquals(unlockedBadges.length, 1);
  assertEquals(unlockedBadges[0].userId, testUserId);
});

Deno.test("should return empty array for user with no badges", async () => {
  const differentUserId = crypto.randomUUID();

  const unlockedBadges = await repo.badgesUnlockedByUser(differentUserId);

  assertEquals(unlockedBadges.length, 0);
});

Deno.test("should mark badge unlock as seen", async () => {
  await repo.unlockBadge(testUserId, testBadge);

  const unlockedBadges = await repo.badgesUnlockedByUser(testUserId);
  const unseenBadge = unlockedBadges.find((badge) => badge.seenAt === null);

  assert(unseenBadge !== undefined);

  const result = await repo.markBadgeUnlockAsSeen(testUserId, unseenBadge.id);

  assertEquals(result.userId, testUserId);
  assertEquals(result.badgeSlug, unseenBadge.badgeSlug);
  assertEquals(result.seenAt !== null, true);
});

Deno.test("should work with custom timestamp", async () => {
  await repo.unlockBadge(testUserId, testBadge);
  const customTimestamp = Temporal.Now.zonedDateTimeISO("UTC").subtract({ hours: 1 });

  const unlockedBadges = await repo.badgesUnlockedByUser(testUserId);
  const unseenBadge = unlockedBadges.find((badge) => badge.seenAt === null);

  assert(unseenBadge !== undefined);

  const result = await repo.markBadgeUnlockAsSeen(testUserId, unseenBadge.id, customTimestamp);
  assertEquals(result.seenAt?.toString(), customTimestamp.toString());
});

Deno.test("should throw error for non-existent unlock", async () => {
  const nonExistentId = crypto.randomUUID();

  await assertRejects(
    () => repo.markBadgeUnlockAsSeen(testUserId, nonExistentId),
    Error,
    `Unlocked Badge with ID "${nonExistentId}" not found`,
  );
});

Deno.test("should throw error when trying to mark already seen badge", async () => {
  const unlock = await repo.unlockBadge(testUserId, testBadge);
  await repo.markBadgeUnlockAsSeen(testUserId, unlock.id);

  const unlockedBadges = await repo.badgesUnlockedByUser(testUserId);
  const seenBadge = unlockedBadges.find((badge) => badge.seenAt !== null);

  assert(seenBadge !== undefined);

  await assertRejects(
    () => repo.markBadgeUnlockAsSeen(testUserId, seenBadge.id),
    Error,
    `Unlocked Badge with ID "${seenBadge.id}" not found`,
  );
});
