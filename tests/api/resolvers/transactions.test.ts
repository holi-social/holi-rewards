import { assert, assertExists, assertIsError } from "@std/assert";
import { sample } from "@std/random";
import gql from "@taras/graphql-tag";
import { GraphQLError } from "graphql";
import type { Paged } from "../../../src/api/resolvers/types.ts";
import { transaction } from "../../../src/db/schema.ts";
import { RewardType } from "../../../src/types.ts";
import { createTestDb, resetDb } from "../../db/helpers.ts";
import { assertSingleValue, createTestClient } from "../helpers.ts";

const db = await createTestDb();
Deno.test.beforeEach(async () => await resetDb(db));

const transactionsQuery = gql`
  query Transactions($limit: Int = 10, $offset: Int = 0) {
    transactions(limit: $limit, offset: $offset) {
      totalResults
      data {
        id
        createdAt
        rewardType
      }
    }
  }
`;
type TransactionsQueryResult = { transactions: Paged<{ id: string; createdAt: string; rewardType: string }> };

Deno.test("should error if called without user ID", async () => {
  await using client = createTestClient(db);
  const result = await client({
    document: transactionsQuery,
  });

  assertSingleValue(result);
  assert(result.data === null);
  assertExists(result.errors);
  assert(result.errors.length === 1);

  const error = result.errors[0];
  assertIsError(error, GraphQLError, "User is not authenticated");
});

const userId = crypto.randomUUID();

Deno.test("should return correct count", async () => {
  await db
    .insert(transaction)
    // 15 transactions for our user, 10 transactions for another user
    .values([...generateTransactions(15, userId), ...generateTransactions(10, crypto.randomUUID())]);

  await using client = createTestClient(db, userId);
  const result = await client<TransactionsQueryResult>({
    document: transactionsQuery,
    variables: { limit: 5 },
  });

  assertSingleValue(result);
  assertExists(result.data);

  assert(result.data.transactions.totalResults === 15);
  assert(result.data.transactions.data.length === 5);
});

const generateTransactions = (amount: number, userId: string) =>
  [...Array(amount).keys()].map(() => ({
    userId,
    rewardType: sample([
      RewardType.CHALLENGE_SUBMITTED,
      RewardType.EXTERNAL_VOLUNTEERING_OPPORTUNITY_STARTED,
      RewardType.GOOD_DEED_POST_CREATED,
      RewardType.TASK_COMPLETED,
    ])!,
  }));
