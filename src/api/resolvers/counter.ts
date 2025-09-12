import { TransactionRepository } from "../../db/repository/transaction.ts";
import { authenticatedUser } from "./helpers.ts";
import type { Resolver } from "./types.ts";

const resolver: Resolver<{ counter: number | null }> = async (
  _,
  _args,
  { request, db },
): Promise<{ counter: number | null }> => {
  const repo = new TransactionRepository(db);
  const userId = authenticatedUser(request);

  const counter = await repo.getCounterForUser(userId);
  return { counter };
};

export default resolver;
