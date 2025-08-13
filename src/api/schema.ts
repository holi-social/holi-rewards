import {
  DateTimeISOResolver,
  DateTimeISOTypeDefinition,
} from "graphql-scalars";
import { createSchema } from "graphql-yoga";

import counterResolver from "./resolvers/counter.ts";
import globalCounterResolver from "./resolvers/globalCounter.ts";
import transactionsResolver from "./resolvers/transactions.ts";

export const schema = createSchema({
  typeDefs: `
    ${DateTimeISOTypeDefinition}

    type RewardsCounter {
      counter: Int
    }

    enum RewardType {
      ChallengeSubmitted
      GoodDeedPostCreated
      ExternalVolunteeringOpportunityStarted
    }

    type Transaction {
      id: ID!
      rewardType: RewardType!
      createdAt: DateTimeISO!
    }

    type PagedTransactions {
      data: [Transaction]!
      totalResults: Int!
    }

    type Query {
      counter: RewardsCounter!
      globalCounter: RewardsCounter!
      transactions(offset: Int! = 0, limit: Int! = 10): PagedTransactions!
    }
  `,
  resolvers: {
    DateTimeISO: DateTimeISOResolver,
    Query: {
      counter: counterResolver,
      globalCounter: globalCounterResolver,
      transactions: transactionsResolver,
    },
  },
});

export default schema;
