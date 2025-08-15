import { createDbConnection } from "../../db/connection.ts";
import {
  ExternalCounterValueRepository,
  TransactionRepository,
} from "../../db/repository.ts";
import type { Resolver, RewardsCounter } from "../schema/types.ts";

const resolver: Resolver<
  RewardsCounter
> = async (): Promise<RewardsCounter> => {
  const dbConnection = createDbConnection();

  const transactions = new TransactionRepository(dbConnection);
  const externalCounter = new ExternalCounterValueRepository(dbConnection);

  const onPlatformCounter = await transactions.countAll();
  const offPlatformCounter = await externalCounter.getLatestValue();

  return { counter: onPlatformCounter + offPlatformCounter };
};

export default resolver;
