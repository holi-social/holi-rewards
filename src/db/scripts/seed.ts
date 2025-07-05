import { createDbConnection } from "../connection.ts";
import { seed } from "drizzle-seed";
import { transaction } from "../schema.ts";
import { RewardType } from "../../types.ts";
import { randomInt, randomUUID } from "node:crypto";

const db = createDbConnection();

const USER_COUNT = 3;
const TRANSACTIONS_PER_USER = 10;

const userUuids = Array.from({ length: USER_COUNT }, randomUUID);

for (const userId of userUuids) {
  await seed(
    db,
    { transaction },
    { seed: randomInt(0, 1024) }, // without specifying a custom seed, it will generate the same IDs for each user, leading to a duplicate key violation
  ).refine((f) => ({
    transaction: {
      columns: {
        id: f.uuid(),
        userId: f.default({ defaultValue: userId }),
        rewardType: f.valuesFromArray({
          values: [RewardType.CHALLENGE_SUBMITTED, RewardType.POST_CREATED],
        }),
        rewardValue: f.default({ defaultValue: 1 }),
        createdAt: f.timestamp(),
      },
      count: TRANSACTIONS_PER_USER,
    },
  }));
}

console.log(
  `Seeded random transaction for user IDs:\n* ${userUuids.join("\n* ")}`,
);
