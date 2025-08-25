import { TransactionRepository } from "../../db/repository/transaction.ts";
import { authenticatedUser } from "./helpers.ts";
import type { Paged, Resolver } from "./types.ts";

const resolver: Resolver<
  Paged<{ id: string; createdAt: Temporal.ZonedDateTime; rewardType: string }>,
  { offset: number; limit: number }
> = async (_, { offset, limit }, { request, db }) => {
  const repo = new TransactionRepository(db);
  const userId = authenticatedUser(request);

  const [transactions, count] = await repo.getAllForUserId(userId, offset, limit);

  return {
    totalResults: count,
    data: transactions.map((t) => ({
      id: t.id,
      createdAt: t.createdAt,
      rewardType: t.rewardType,
    })),
  };
};

export default resolver;
