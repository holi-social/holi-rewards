import SchemaBuilder from "@pothos/core";
import MocksPlugin from "@pothos/plugin-mocks";
import { DateTimeISOResolver } from "graphql-scalars";
import type { YogaInitialContext } from "graphql-yoga";
import { RewardType } from "../../types.ts";
import { temporalToLegacyDate } from "../../utils.ts";
import counterResolver from "../resolvers/counter.ts";
import globalCounterResolver from "../resolvers/globalCounter.ts";
import transactionsResolver from "../resolvers/transactions.ts";
import type { Paged, RewardsCounter, Transaction } from "./types.ts";

export const schemaBuilder = new SchemaBuilder<{
  Scalars: {
    DateTimeISO: {
      Input: Date;
      Output: Date;
    };
  };
  Context: YogaInitialContext;
}>({
  plugins: [MocksPlugin],
});

schemaBuilder.addScalarType("DateTimeISO", DateTimeISOResolver, {});

const RewardTypeRef = schemaBuilder.enumType("RewardType", {
  // pothos by default uses the enum keys to expose
  // but we used the values previously
  values: Object.fromEntries(
    Object.entries(RewardType).map(([_, v]) => [v, { value: v }]),
  ),
});

const TransactionRef = schemaBuilder
  .objectRef<Transaction>("Transaction")
  .implement({
    fields: (t) => ({
      id: t.exposeID("id"),
      rewardType: t.expose("rewardType", {
        type: RewardTypeRef,
        nullable: false,
      }),
      createdAt: t.field({
        type: "DateTimeISO",
        resolve: (transaction) => temporalToLegacyDate(transaction.createdAt),
      }),
    }),
  });

const PagedTransactionsRef = schemaBuilder
  .objectRef<Paged<Transaction>>("PagedTransactions")
  .implement({
    fields: (t) => ({
      totalResults: t.exposeInt("totalResults", { nullable: false }),
      data: t.expose("data", {
        type: t.listRef(TransactionRef),
      }),
    }),
  });

const RewardsCounterRef = schemaBuilder
  .objectRef<RewardsCounter>("RewardsCounter")
  .implement({
    fields: (t) => ({
      counter: t.exposeInt("counter"),
    }),
  });

schemaBuilder.queryType({
  fields: (t) => ({
    transactions: t.field({
      type: PagedTransactionsRef,
      nullable: false,
      args: {
        offset: t.arg.int({ defaultValue: 0, required: true }),
        limit: t.arg.int({ defaultValue: 10, required: true }),
      },
      resolve: transactionsResolver,
    }),

    counter: t.field({
      type: RewardsCounterRef,
      nullable: false,
      resolve: counterResolver,
    }),

    globalCounter: t.field({
      type: RewardsCounterRef,
      nullable: false,
      resolve: globalCounterResolver,
    }),
  }),
});
