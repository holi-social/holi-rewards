import { and, eq } from "drizzle-orm";
import { transaction as transactionsTable } from "../db/schema.ts";
import type { RewardType } from "../types.ts";
import type { BadgeConfig, GetProgress } from "./types.ts";

export const repeatedActionBadge = (slug: string, rewardType: RewardType, progressGoal: number): BadgeConfig => {
  const progressFn: GetProgress = (userId, db) =>
    db.$count(
      transactionsTable,
      and(eq(transactionsTable.userId, userId), eq(transactionsTable.rewardType, rewardType)),
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

export const firstTimeBadge = (slug: string, rewardType: RewardType) => repeatedActionBadge(slug, rewardType, 1);
