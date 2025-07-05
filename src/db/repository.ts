import { createDbConnection } from "./connection.ts";
import { transaction as transactionTable } from "./schema.ts";
import { InsertTransactionRow, TransactionRow } from "./types.ts";
import { desc, eq, sql } from "drizzle-orm";

export class TransactionRepository {
  static build(): TransactionRepository {
    return new this(createDbConnection());
  }

  constructor(private readonly db: ReturnType<typeof createDbConnection>) {}

  async create(
    transaction: InsertTransactionRow,
  ): Promise<void> {
    await this.db.insert(transactionTable).values(transaction);
  }

  async getCounterForUser(userId: string): Promise<number | null> {
    const result = await this.db.select({
      counter: sql<number>`cast(sum(${transactionTable.rewardValue}) as int)`,
    }).from(transactionTable)
      .groupBy(transactionTable.userId)
      .where(eq(transactionTable.userId, userId));

    if (result.length === 0) {
      return null;
    }

    return result[0].counter;
  }

  async getAllForUserId(
    userId: string,
  ): Promise<TransactionRow[]> {
    return await this.db.query.transactions.findMany({
      where: eq(transactionTable.userId, userId),
      orderBy: [desc(transactionTable.createdAt)],
    });
  }
}
