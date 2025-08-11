import { createSchema } from "graphql-yoga";
import counterResolver from "./resolvers/counter.ts";
import globalCounterResolver from "./resolvers/globalCounter.ts";

export const schema = createSchema({
  typeDefs: `
    type RewardsCounter {
      counter: Int
    }

    type Query {
      counter: RewardsCounter!
      globalCounter: RewardsCounter!
    }
  `,
  resolvers: {
    Query: {
      counter: counterResolver,
      globalCounter: globalCounterResolver,
    },
  },
});

export default schema;
