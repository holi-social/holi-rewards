import { randomUUID } from "node:crypto";
import { assert, assertEquals } from "@std/assert";
import { randomIntegerBetween, sample } from "@std/random";
import { TransactionRepository } from "../../../src/db/repository/transaction.ts";
import { transaction } from "../../../src/db/schema.ts";
import type { InsertTransactionRow } from "../../../src/db/types.ts";
import { RewardType } from "../../../src/types.ts";
import { createTestDb, resetDb } from "../helpers.ts";

const db = await createTestDb();
Deno.test.beforeEach(async () => await resetDb(db));

const repo = new TransactionRepository(db);
const testUserId = randomUUID() as string;

Deno.test("should return correct count for user", async () => {
  await db.insert(transaction).values(generateTransactions(testUserId, 3));

  const actual = await repo.getCounterForUser(testUserId);
  assertEquals(actual, 3);
});

Deno.test("should return null for unknown user", async () => {
  const actual = await repo.getCounterForUser(randomUUID());
  assertEquals(actual, null);
});

Deno.test("should return correct count from getAllForUserId", async () => {
  await db.insert(transaction).values(generateTransactions(testUserId, 3, 2));

  const [, actual] = await repo.getAllForUserId(testUserId);
  assertEquals(actual, 3);
});

Deno.test("should return transactions sorted by most recent first", async () => {
  await db.insert(transaction).values(generateTransactions(testUserId, 3, 2));

  const [actual] = await repo.getAllForUserId(testUserId);

  const sorted = actual.toSorted((a, b) => b.createdAt.epochMilliseconds - a.createdAt.epochMilliseconds);
  assertEquals(sorted, actual);
});

Deno.test("should only include transactions by specified user", async () => {
  await db.insert(transaction).values(generateTransactions(testUserId, 3, 2));

  const [actual] = await repo.getAllForUserId(testUserId);

  assert(actual.every((tx) => tx.userId === testUserId));
});

Deno.test("should return the correct count for countAll", async () => {
  await db.insert(transaction).values(generateTransactions(testUserId, 3, 2));

  const actual = await repo.countAll();
  assertEquals(actual, 5);
});

const generateTransactions = (
  userId: string,
  amountForUser: number,
  amountForOtherUsers: number = 0,
): InsertTransactionRow[] => {
  const randomRewardType = () =>
    sample([
      RewardType.CHALLENGE_SUBMITTED,
      RewardType.EXTERNAL_VOLUNTEERING_OPPORTUNITY_STARTED,
      RewardType.GOOD_DEED_POST_CREATED,
    ])!;

  const randomTimestamp = () =>
    Temporal.Now.zonedDateTimeISO("UTC").subtract({
      days: randomIntegerBetween(0, 7),
      seconds: randomIntegerBetween(0, 600),
    });

  return [
    ...new Array(amountForUser).keys().map(() => ({
      userId,
      rewardType: randomRewardType(),
      createdAt: randomTimestamp(),
    })),
    ...new Array(amountForOtherUsers).keys().map(() => ({
      userId: randomUUID(),
      rewardType: randomRewardType(),
      createdAt: randomTimestamp(),
    })),
  ];
};
