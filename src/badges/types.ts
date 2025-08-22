import type { DbConnection } from "../db/connection.ts";

export type CheckEligibility = (userId: string, db: DbConnection) => Promise<boolean>;

export type GetProgress = (userId: string, db: DbConnection) => Promise<number>;
export type Progress = [number | undefined, number | undefined];

export type BadgeConfig = {
  slug: string;
  userIsEligible: CheckEligibility;

  progressMade: GetProgress;
  progressGoal?: number;
};

export type UnlockedBadge = {
  id: string;
  slug: string;
  unlockedAt: Temporal.ZonedDateTime;
  seenAt?: Temporal.ZonedDateTime;
};

export type InProgressBadge = {
  slug: string;
  progressMade: number;
  progressGoal?: number;
};
