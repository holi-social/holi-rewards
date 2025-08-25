import { ExternalCounterValueRepository } from "../../db/repository/externalCounter.ts";
import { TransactionRepository } from "../../db/repository/transaction.ts";
import type { Resolver } from "./types.ts";

const resolver: Resolver<{ counter: number }> = async (_, _args, { db }) => {
  const transactions = new TransactionRepository(db);
  const externalCounter = new ExternalCounterValueRepository(db);

  const onPlatformCounter = await transactions.countAll();
  const offPlatformCounter = await externalCounter.getLatestValue();

  return { counter: onPlatformCounter + offPlatformCounter };
};

export default resolver;
