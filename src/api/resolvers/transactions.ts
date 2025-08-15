import { createGraphQLError } from "graphql-yoga";
import { TransactionRepository } from "../../db/repository.ts";
import { getLogger } from "../../logger.ts";
import type { RewardType } from "../../types.ts";
import type { Paged, Resolver, Transaction } from "../schema/types.ts";

const USER_ID_HEADER = "X-Holi-User-ID";
const logger = getLogger("grapqhl", "transactions");

const resolver: Resolver<
  Paged<Transaction>,
  { offset: number; limit: number }
> = async (_, { offset, limit }, { request }): Promise<Paged<Transaction>> => {
  const repo = TransactionRepository.build();

  const userId = request.headers.get(USER_ID_HEADER);
  if (!userId || userId === "anonymous") {
    logger.error("Could not resolve user from request", { request });
    throw createGraphQLError("User is not authenticated");
  }

  const [transactions, count] = await repo.getAllForUserId(
    userId,
    offset,
    limit,
  );

  return {
    totalResults: count,
    data: transactions.map((t) => ({
      id: t.id,
      createdAt: t.createdAt,
      rewardType: t.rewardType as RewardType,
    })),
  };
};

export default resolver;
