import { createGraphQLError, type YogaInitialContext } from "graphql-yoga";
import { TransactionRepository } from "../../db/repository.ts";
import { getLogger } from "../../logger.ts";
import { temporalToLegacyDate } from "../../utils.ts";
import type { Paged } from "./types.ts";

const USER_ID_HEADER = "X-Holi-User-ID";
const logger = getLogger("grapqhl", "transactions");

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
    createdAt: Date;
    rewardType: string;
  }>
> => {
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
      createdAt: temporalToLegacyDate(t.createdAt),
      rewardType: t.rewardType,
    })),
  };
};

export default resolver;
