import { assert, assertEquals, assertExists, assertIsError } from "@std/assert";
import gql from "@taras/graphql-tag";
import { GraphQLError } from "graphql";
import badgesConfig from "../../../src/badges/config.ts";
import { unlockedBadge } from "../../../src/db/schema.ts";
import { createTestDb, resetDb } from "../../db/helpers.ts";
import { assertSingleValue, createTestClient } from "../helpers.ts";

const db = await createTestDb();
Deno.test.beforeEach(async () => await resetDb(db));

const badgesQuery = gql`
  {
    badges {
      unlocked {
        id
        slug
        unlockedAt
        seenAt
      }

      inProgress {
        slug
        progressMade
        progressGoal
      }
    }
  }
`;
type BadgesQueryResult = {
  badges: {
    unlocked: {
      id: string;
      slug: string;
      unlockedAt: string;
      seenAt: string | null;
    }[];
    inProgress: {
      slug: string;
      progressMade: number;
      progressGoal?: number;
    }[];
  };
};

Deno.test("should error when called without user ID", async () => {
  await using client = createTestClient(db);
  const result = await client({
    document: badgesQuery,
  });

  assertSingleValue(result);
  assert(result.data === null);
  assertExists(result.errors);
  assert(result.errors.length === 1);

  const error = result.errors[0];
  assertIsError(error, GraphQLError, "User is not authenticated");
});

const userId = crypto.randomUUID();

Deno.test("should return unlocked badge", async () => {
  await db.insert(unlockedBadge).values([{ badgeSlug: "impact.spark", userId }]);
  await using client = createTestClient(db, userId);
  const result = await client<BadgesQueryResult>({
    document: badgesQuery,
  });

  assertSingleValue(result);
  assertExists(result.data);

  assertEquals(result.data.badges.unlocked.length, 1);
  assertEquals(result.data.badges.unlocked[0].slug, "impact.spark");
});

Deno.test("should return all in progress without data", async () => {
  await using client = createTestClient(db, userId);
  const result = await client<BadgesQueryResult>({
    document: badgesQuery,
  });

  assertSingleValue(result);
  assertExists(result.data);
  assertEquals(result.data.badges.inProgress.length, badgesConfig.length);
});

Deno.test("should return unlocked badge unseen", async () => {
  await db.insert(unlockedBadge).values([{ badgeSlug: "impact.spark", userId }]);
  await using client = createTestClient(db, userId);
  const result = await client<BadgesQueryResult>({
    document: badgesQuery,
  });

  assertSingleValue(result);
  assertExists(result.data);

  assertEquals(result.data.badges.unlocked.length, 1);
  assertEquals(result.data.badges.unlocked[0].seenAt, null);
});
