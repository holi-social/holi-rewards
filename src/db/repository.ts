import { desc, eq, sql } from "drizzle-orm";
import { createDbConnection } from "./connection.ts";
import { transaction as transactionTable } from "./schema.ts";
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

  async getAllForUserId(
    userId: string,
    offset: number = 0,
    limit: number = 10,
  ): Promise<[TransactionRow[], number]> {
    const count = await this.db.$count(
      transactionTable,
      eq(transactionTable.userId, userId),
    );

    const resultSlice = await this.db.query.transactions.findMany({
      where: eq(transactionTable.userId, userId),
      orderBy: [desc(transactionTable.createdAt)],
      limit,
      offset,
    });

    return [resultSlice, count];
  }
}
