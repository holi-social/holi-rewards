import type { YogaInitialContext } from "graphql-yoga";
import { TransactionRepository } from "../../db/repository/transaction.ts";
import { authenticatedUser } from "./helpers.ts";

const resolver = async (
  _: never,
  _args: Record<string, never>,
  { request }: YogaInitialContext,
): Promise<{ counter: number | null }> => {
  const repo = TransactionRepository.build();
  const userId = authenticatedUser(request);

  const counter = await repo.getCounterForUser(userId);
  return { counter };
};

export default resolver;
