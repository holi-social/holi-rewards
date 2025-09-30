import { assert } from "@std/assert";
import { createDbConnection, type DbConnection } from "../db/connection.ts";
import { UnlockedBadgeRepository } from "../db/repository/unlockedBadge.ts";
import allBadges from "./config.ts";
import type { BadgeConfig, InProgressBadge, UnlockedBadge } from "./types.ts";

export class BadgesService {
  static build(dbConnection?: DbConnection, badgeConfigs: BadgeConfig[] = allBadges) {
    dbConnection = dbConnection ?? createDbConnection();
    return new BadgesService(new UnlockedBadgeRepository(dbConnection), dbConnection, badgeConfigs);
  }

  constructor(
    private readonly repo: UnlockedBadgeRepository,
    private readonly db: DbConnection,
    private readonly badgeConfigs: BadgeConfig[] = allBadges,
  ) {
    BadgesService.validateBadgeConfig(badgeConfigs);
  }

  async unlockNewBadgesForUser(userId: string, seenAt?: Temporal.ZonedDateTime): Promise<void> {
    const potentiallyEligibleBadges = await this.badgeConfigsUserHasNotUnlocked(userId);

    for (const badge of potentiallyEligibleBadges) {
      const isEligible = await badge.userIsEligible(userId, this.db);
      if (!isEligible) continue;

      await this.repo.unlockBadge(userId, badge, seenAt);
    }
  }

  async getUnlockedBadgesForUser(userId: string): Promise<UnlockedBadge[]> {
    const badges = await this.repo.badgesUnlockedByUser(userId);
    return badges.map((row) => ({
      id: row.id,
      slug: row.badgeSlug,
      progressGoal: this.getBadgeConfigBySlug(row.badgeSlug)?.progressGoal,
      unlockedAt: row.unlockedAt,
      seenAt: row.seenAt,
    }));
  }

  async getProgressForUser(userId: string): Promise<InProgressBadge[]> {
    const potentialBadges = await this.badgeConfigsUserHasNotUnlocked(userId);

    const result: InProgressBadge[] = [];

    for (const badge of potentialBadges) {
      const progressMade = await badge.progressMade(userId, this.db);
      result.push({
        slug: badge.slug,
        progressMade,
        progressGoal: badge.progressGoal,
      });
    }

    return result;
  }

  async markBadgeUnlockAsSeen(
    userId: string,
    unlockId: string,
    timestamp?: Temporal.ZonedDateTime,
  ): Promise<UnlockedBadge> {
    const updatedRow = await this.repo.markBadgeUnlockAsSeen(userId, unlockId, timestamp);
    return {
      id: updatedRow.id,
      slug: updatedRow.badgeSlug,
      progressGoal: this.getBadgeConfigBySlug(updatedRow.badgeSlug)?.progressGoal,
      unlockedAt: updatedRow.unlockedAt,
      seenAt: updatedRow.seenAt,
    };
  }

  private async badgeConfigsUserHasNotUnlocked(userId: string): Promise<BadgeConfig[]> {
    const alreadyUnlocked = await this.repo.badgesUnlockedByUser(userId);
    const slugsAlreadyUnlocked = alreadyUnlocked.map((badge) => badge.badgeSlug);

    return this.badgeConfigs.filter(({ slug }) => !slugsAlreadyUnlocked.includes(slug));
  }

  private getBadgeConfigBySlug(slug: string): BadgeConfig | undefined {
    return this.badgeConfigs.find((cfg) => cfg.slug === slug);
  }

  private static validateBadgeConfig(config: BadgeConfig[]): void {
    const slugs = config.map((badge) => badge.slug);
    assert(new Set(slugs).size === slugs.length, "Badge slugs must be unique");
  }
}
