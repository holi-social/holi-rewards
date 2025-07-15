import { randomUUID } from "node:crypto";
import { randomIntegerBetween, sample } from "@std/random";
import { ulid } from "ulid";
import { RewardType } from "../../types.ts";
import { TransactionRepository } from "../repository.ts";

const USER_COUNT = 3;
const TRANSACTIONS_PER_USER = 10;

const userUuids = Array.from({ length: USER_COUNT }, randomUUID);
const repo = TransactionRepository.build();

const randomTimestampInLastSevenDays = () => {
  const now = Temporal.Now.zonedDateTimeISO("UTC");
  const earliest = now.subtract(Temporal.Duration.from({ days: 7 }));

  const randomTimestampBetween = randomIntegerBetween(
    earliest.epochMilliseconds,
    now.epochMilliseconds,
  );

  return Temporal.Instant.fromEpochMilliseconds(
    randomTimestampBetween,
  ).toZonedDateTimeISO("UTC");
};

for (const userId of userUuids) {
  // TODO(alex): replace with drizzle-seed when https://github.com/drizzle-team/drizzle-orm/issues/4056 is resolved
  await Promise.all(
    [...new Array(TRANSACTIONS_PER_USER)].map(() => {
      const timestamp = randomTimestampInLastSevenDays();

      return repo.create({
        id: ulid(timestamp.epochMilliseconds),
        userId,
        rewardType: sample([
          RewardType.CHALLENGE_SUBMITTED,
          RewardType.GOOD_DEED_POST_CREATED,
        ])!,
        rewardValue: 1,
        createdAt: timestamp,
      });
    }),
  );
}

console.log(
  `Seeded random transaction for user IDs:\n* ${userUuids.join("\n* ")}`,
);
