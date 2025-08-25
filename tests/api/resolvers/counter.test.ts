import { assert } from "node:console";
import { assertExists, assertIsError, assertObjectMatch } from "@std/assert";
import { gql } from "@taras/graphql-tag";
import { GraphQLError } from "graphql";
import { transaction } from "../../../src/db/schema.ts";
import { RewardType } from "../../../src/types.ts";
import { createTestDb, resetDb } from "../../db/helpers.ts";
import { assertSingleValue, createTestClient } from "../helpers.ts";

const db = await createTestDb();
Deno.test.beforeEach(async () => await resetDb(db));

Deno.test("should return correct counter for user with transactions", async () => {
  const userId = crypto.randomUUID();
  await db.insert(transaction).values([
    { userId, rewardType: RewardType.TASK_COMPLETED },
    { userId, rewardType: RewardType.CHALLENGE_SUBMITTED },
    { userId, rewardType: RewardType.GOOD_DEED_POST_CREATED },
  ]);

  await using executor = createTestClient(db, userId);
  const result = await executor({
    document: gql`{
      counter {
        counter
      }
    }`,
  });

  assertSingleValue(result);
  assertObjectMatch(result, {
    data: {
      counter: {
        counter: 3,
      },
    },
  });
});

Deno.test("should return null for user with no transactions", async () => {
  const userId = crypto.randomUUID();
  await using executor = createTestClient(db, userId);
  const result = await executor({
    document: gql`{
      counter {
        counter
      }
    }`,
  });

  assertSingleValue(result);
  assertObjectMatch(result, {
    data: {
      counter: {
        counter: null,
      },
    },
  });
  assert(result.data.counter.counter === null);
});

Deno.test("should return correct count for transactions with different values", async () => {
  const userId = crypto.randomUUID();
  await db.insert(transaction).values([
    { userId, rewardType: RewardType.TASK_COMPLETED, rewardValue: 5 },
    { userId, rewardType: RewardType.CHALLENGE_SUBMITTED },
  ]);

  await using client = createTestClient(db, userId);
  const result = await client({
    document: gql`
      {
        counter {
          counter
        }
      }
    `,
  });

  assertSingleValue(result);
  assertObjectMatch(result, {
    data: {
      counter: {
        counter: 6,
      },
    },
  });
});

Deno.test("should error if called without a user ID", async () => {
  await using client = createTestClient(db);
  const result = await client({
    document: gql`
      {
        counter {
          counter
        }
      }
    `,
  });

  assertSingleValue(result);
  assert(result.data === null);
  assertExists(result.errors);
  assert(result.errors.length === 1);

  const error = result.errors[0];
  assertIsError(error, GraphQLError, "User is not authenticated");
});
