import { createSchema } from "graphql-yoga";
import type { GraphQLUserContext } from "./context.ts";
import { DateTimeISOResolver, DateTimeISOTypeDefinition } from "./resolvers/datetime.ts";
import { mutations, queries } from "./resolvers/index.ts";

export const schemaTypes = `
  ${DateTimeISOTypeDefinition}

  type RewardsCounter {
    counter: Int
  }

  enum RewardType {
    ChallengeSubmitted
    GoodDeedPostCreated
    ExternalVolunteeringOpportunityStarted
    ExternalPetitionSigned
    TaskCompleted
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

  type UnlockedBadge {
    id: ID!
    slug: String!
    progressGoal: Int!
    unlockedAt: DateTimeISO!
    seenAt: DateTimeISO
  }

  type InProgressBadge {
    slug: String!
    progressMade: Int
    progressGoal: Int
  }

  type BadgesOverview {
    unlocked: [UnlockedBadge]!
    inProgress: [InProgressBadge]!
  }

  type Query {
    counter: RewardsCounter!
    globalCounter: RewardsCounter!
    transactions(offset: Int! = 0, limit: Int! = 10): PagedTransactions!
    badges: BadgesOverview!
  }

  type Mutation {
    markBadgeUnlockAsSeen(unlockId: ID!): UnlockedBadge!
  }
`;

export const schema = createSchema<GraphQLUserContext>({
  typeDefs: schemaTypes,
  resolvers: {
    DateTimeISO: DateTimeISOResolver,
    Query: queries,
    Mutation: mutations,
  },
});

export default schema;
