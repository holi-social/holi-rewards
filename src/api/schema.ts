import { createSchema } from "graphql-yoga";
import counterResolver from "./resolvers/counter.ts";

export const schema = createSchema({
  typeDefs: `
    type RewardsCounter {
      counter: Int
    }

    type Query {
      counter: RewardsCounter!
    }
  `,
  resolvers: {
    Query: {
      counter: counterResolver,
    },
  },
});

export default schema;
