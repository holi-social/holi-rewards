import type { transaction as transactionTable } from "./schema.ts";

export type InsertTransactionRow = typeof transactionTable.$inferInsert;
export type TransactionRow = typeof transactionTable.$inferSelect;
