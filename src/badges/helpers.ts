import { and, eq, inArray } from "drizzle-orm";
import { transaction as transactionsTable } from "../db/schema.ts";
import type { RewardType } from "../types.ts";
import type { BadgeConfig, GetProgress } from "./types.ts";

export const repeatedActionBadge = (slug: string, rewardTypes: RewardType[], progressGoal: number): BadgeConfig => {
  const progressFn: GetProgress = (userId, db) =>
    db.$count(
      transactionsTable,
      and(eq(transactionsTable.userId, userId), inArray(transactionsTable.rewardType, rewardTypes)),
    );

  return {
    slug,

    progressMade: progressFn,
    progressGoal,

    userIsEligible: async (userId, db) => {
      const count = await progressFn(userId, db);
      return count >= progressGoal;
    },
  };
};

export const firstTimeBadge = (slug: string, rewardTypes: RewardType[]) => repeatedActionBadge(slug, rewardTypes, 1);
