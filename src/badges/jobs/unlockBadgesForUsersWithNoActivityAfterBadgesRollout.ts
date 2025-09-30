import { createDbConnection } from "../../db/connection.ts";
import { TransactionRepository } from "../../db/repository/transaction.ts";
import { transaction } from "../../db/schema.ts";
import { getLogger } from "../../logger.ts";
import { BadgesService } from "../index.ts";

/**
 * We need to run this once to migrate users that didn't have any activity
 * after we deployed the badge system.
 */
export const unlockBadgesForUsersWithNoActivityAfterBadgesRollout = async () => {
  const logger = getLogger("jobs", "unlockBadgesForSemiActiveUsers");

  const db = createDbConnection();
  const badges = BadgesService.build(db);
  const transactions = new TransactionRepository(db);

  const usersWithTransactions = (await db.selectDistinct({ userId: transaction.userId }).from(transaction)).map(
    (row) => row.userId,
  );

  for (const userId of usersWithTransactions) {
    const timestamp =
      (await transactions.getAllForUserId(userId, 0, 1))[0][0]?.createdAt ?? Temporal.Now.zonedDateTimeISO();

    logger.info("unlocking badges for user", { userId, timestamp });
    await badges.unlockNewBadgesForUser(userId, timestamp);
  }
};

await unlockBadgesForUsersWithNoActivityAfterBadgesRollout();
