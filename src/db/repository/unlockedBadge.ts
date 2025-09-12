import { and, eq, isNull } from "drizzle-orm";
import type { BadgeConfig } from "../../badges/types.ts";
import type { DbConnection } from "../connection.ts";
import { unlockedBadge as table } from "../schema.ts";

type UnlockedBadgeRow = typeof table.$inferSelect;

export class UnlockedBadgeRepository {
  constructor(private readonly db: DbConnection) {}

  async unlockBadge(userId: string, badge: BadgeConfig): Promise<UnlockedBadgeRow> {
    return (
      await this.db
        .insert(table)
        .values({
          userId,
          badgeSlug: badge.slug,
        })
        .returning()
    )[0];
  }

  async markBadgeUnlockAsSeen(
    userId: string,
    unlockId: string,
    timestamp?: Temporal.ZonedDateTime,
  ): Promise<UnlockedBadgeRow> {
    const updatedRow = await this.db
      .update(table)
      .set({
        seenAt: timestamp ?? Temporal.Now.zonedDateTimeISO("UTC"),
      })
      .where(and(eq(table.userId, userId), eq(table.id, unlockId), isNull(table.seenAt)))
      .returning();

    if (updatedRow.length === 0) {
      throw new Error(`Unlocked Badge with ID "${unlockId}" not found`);
    }

    return updatedRow[0];
  }

  async badgesUnlockedByUser(userId: string): Promise<UnlockedBadgeRow[]> {
    return await this.db.query.unlockedBadges.findMany({
      where: eq(table.userId, userId),
    });
  }

  async isBadgeUnlockedForUser(userId: string, badge: BadgeConfig): Promise<boolean> {
    const count = await this.db.$count(table, and(eq(table.userId, userId), eq(table.badgeSlug, badge.slug)));
    return count === 1;
  }
}
