import {
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { RewardType } from "../types.ts";

// @ts-expect-error idk why this doesn't match
export const rewardType = pgEnum("reward_type", Object.values(RewardType));

export const transaction = pgTable("transaction", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id").notNull(),
  rewardType: rewardType("reward_type").notNull(),
  rewardValue: integer("reward_value").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index().on(table.userId),
]);
