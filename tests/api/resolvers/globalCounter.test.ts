import { assertObjectMatch } from "@std/assert";
import gql from "@taras/graphql-tag";
import { externalCounterValue, transaction } from "../../../src/db/schema.ts";
import { RewardType } from "../../../src/types.ts";
import { createTestDb, resetDb } from "../../db/helpers.ts";
import { assertSingleValue, createTestClient } from "../helpers.ts";

const db = await createTestDb();
Deno.test.beforeEach(async () => await resetDb(db));

Deno.test("should return correct global counter with no external value set", async () => {
  await db.insert(transaction).values([
    { userId: crypto.randomUUID(), rewardType: RewardType.CHALLENGE_SUBMITTED },
    { userId: crypto.randomUUID(), rewardType: RewardType.GOOD_DEED_POST_CREATED },
  ]);

  await using client = createTestClient(db);
  const result = await client({
    document: gql`
      {
        globalCounter {
          counter
        }
      }
    `,
  });

  assertSingleValue(result);
  assertObjectMatch(result, {
    data: {
      globalCounter: {
        counter: 2,
      },
    },
  });
});

Deno.test("should return correct global counter with external value set", async () => {
  await db.insert(transaction).values([
    { userId: crypto.randomUUID(), rewardType: RewardType.CHALLENGE_SUBMITTED },
    { userId: crypto.randomUUID(), rewardType: RewardType.GOOD_DEED_POST_CREATED },
  ]);

  await db.insert(externalCounterValue).values({ externalCount: 1000 });

  await using client = createTestClient(db);
  const result = await client({
    document: gql`
      {
        globalCounter {
          counter
        }
      }
    `,
  });

  assertSingleValue(result);
  assertObjectMatch(result, {
    data: {
      globalCounter: {
        counter: 1002,
      },
    },
  });
});
