import type { YogaInitialContext } from "graphql-yoga";
import { TransactionRepository } from "../../db/repository/transaction.ts";
import { authenticatedUser } from "./helpers.ts";
import type { Paged } from "./types.ts";

const resolver = async (
  _: never,
  {
    offset,
    limit,
  }: {
    offset: number;
    limit: number;
  },
  { request }: YogaInitialContext,
): Promise<
  Paged<{
    id: string;
    createdAt: Temporal.ZonedDateTime;
    rewardType: string;
  }>
> => {
  const repo = TransactionRepository.build();
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
