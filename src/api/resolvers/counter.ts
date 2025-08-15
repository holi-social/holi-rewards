import { createGraphQLError } from "graphql-yoga";
import { TransactionRepository } from "../../db/repository.ts";
import { getLogger } from "../../logger.ts";
import type { Resolver, RewardsCounter } from "../schema/types.ts";

const USER_ID_HEADER = "X-Holi-User-ID";
const logger = getLogger("grapqhl", "counter");

const resolver: Resolver<RewardsCounter> = async (
  _parent,
  _args,
  { request },
): Promise<RewardsCounter> => {
  const repo = TransactionRepository.build();

  const userId = request.headers.get(USER_ID_HEADER);
  if (!userId || userId === "anonymous") {
    logger.error("Could not resolve user from request", { request });
    throw createGraphQLError("User is not authenticated");
  }

  const counter = await repo.getCounterForUser(userId);
  return { counter };
};

export default resolver;
