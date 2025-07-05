import {
  customType,
  index,
  integer,
  pgEnum,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { RewardType } from "../types.ts";
import { ulid } from "ulid";
import { sql } from "drizzle-orm";

// @ts-expect-error idk why this doesn't match
export const rewardType = pgEnum("reward_type", Object.values(RewardType));

export const zonedTemporalTimestamp = customType<
  {
    data: Temporal.ZonedDateTime;
    driverData: string;
    notNull: true;
    default: false;
  }
>({
  dataType: () => "timestamp with time zone",
  toDriver: (input) => input.toString({ timeZoneName: "never" }),
  fromDriver: (input: unknown) =>
    Temporal.PlainDateTime.from(input as string).toZonedDateTime("UTC"),
});

export const transaction = pgTable("transaction", {
  id: varchar({ length: 26 }).primaryKey().notNull().$defaultFn(ulid),
  userId: uuid("user_id").notNull(),
  rewardType: rewardType("reward_type").notNull(),
  rewardValue: integer("reward_value").notNull().default(1),
  createdAt: zonedTemporalTimestamp("created_at", {
    mode: "string",
    withTimezone: true,
  })
    .default(sql`now()`)
    .$defaultFn(() => Temporal.Now.zonedDateTimeISO("UTC")).notNull(),
}, (table) => [
  index().on(table.userId),
]);
