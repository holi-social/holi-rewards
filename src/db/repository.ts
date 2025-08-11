import { desc, eq, sql } from "drizzle-orm";
import { createDbConnection } from "./connection.ts";
import {
  externalCounterValue as externalCounterValueTable,
  transaction as transactionTable,
} from "./schema.ts";
import type { InsertTransactionRow, TransactionRow } from "./types.ts";

export class TransactionRepository {
  static build(): TransactionRepository {
    return new TransactionRepository(createDbConnection());
  }

  constructor(private readonly db: ReturnType<typeof createDbConnection>) {}

  async create(transaction: InsertTransactionRow): Promise<void> {
    await this.db.insert(transactionTable).values(transaction);
  }

  async getCounterForUser(userId: string): Promise<number | null> {
    const result = await this.db
      .select({
        counter: sql<number>`cast(sum(${transactionTable.rewardValue}) as int)`,
      })
      .from(transactionTable)
      .groupBy(transactionTable.userId)
      .where(eq(transactionTable.userId, userId));

    if (result.length === 0) {
      return null;
    }

    return result[0].counter;
  }

  async getAllForUserId(userId: string): Promise<TransactionRow[]> {
    return await this.db.query.transactions.findMany({
      where: eq(transactionTable.userId, userId),
      orderBy: [desc(transactionTable.createdAt)],
    });
  }

  async countAll(): Promise<number> {
    const result = await this.db
      .select({
        counter: sql<number>`cast(sum(${transactionTable.rewardValue}) as int)`,
      })
      .from(transactionTable);

    return result[0]?.counter ?? 0;
  }
}

export class ExternalCounterValueRepository {
  static build(): ExternalCounterValueRepository {
    return new ExternalCounterValueRepository(createDbConnection());
  }

  constructor(private readonly db: ReturnType<typeof createDbConnection>) {}

  async getLatestValue(): Promise<number> {
    const latest = await this.db
      .select()
      .from(externalCounterValueTable)
      .orderBy(desc(externalCounterValueTable.createdAt))
      .limit(1);

    return latest[0]?.externalCount ?? 0;
  }
}
