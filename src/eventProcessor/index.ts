import { STATUS_CODE, STATUS_TEXT, type StatusCode } from "@std/http";
import type { Handler } from "@std/http/unstable-route";
import { match } from "ts-pattern";
import { BadgesService } from "../badges/index.ts";
import type { DbConnection } from "../db/connection.ts";
import { TransactionRepository } from "../db/repository/transaction.ts";
import { FeatureFlag, FeatureFlags } from "../featureFlag.ts";
import { getLogger } from "../logger.ts";
import { RewardType } from "../types.ts";
import { EventType, safeParseEvent } from "./schema.ts";

const logger = getLogger("eventProcessor");

const featureFlags = FeatureFlags.build();

const EventResponse = {
  ack: () => Response.json({ ok: true }, { status: STATUS_CODE.OK }),
  nack: (status: StatusCode) => Response.json({ ok: false, error: STATUS_TEXT[status] }, { status }),
};

export const handler = async (request: Request, db: DbConnection): Promise<Response> => {
  const parseResult = safeParseEvent(await request.json());
  if (!parseResult.success) {
    logger.info("Failed to parse event", { event: parseResult });
    return EventResponse.nack(STATUS_CODE.BadRequest);
  }

  const event = parseResult.output;
  logger.info("Event parsed successfully", { event });

  const isFeatureFlagEnabled = await featureFlags.isEnabled(FeatureFlag.PHASE_1, event.userId);
  if (!isFeatureFlagEnabled) {
    logger.info("Feature flag is not enabled for user {userId}", { userId: event.userId });
    return EventResponse.ack();
  }

  const repo = new TransactionRepository(db);
  const badges = BadgesService.build(db);

  match(event)
    .with({ eventType: EventType.CHALLENGE_SUBMITTED }, async ({ userId }) => {
      await repo.create({
        rewardType: RewardType.CHALLENGE_SUBMITTED,
        userId,
        rewardValue: 1,
      });
    })
    .with({ eventType: EventType.FEED_POST_CREATED }, async ({ userId, data }) => {
      if (data.category !== "good-deed") {
        return;
      }

      await repo.create({
        rewardType: RewardType.GOOD_DEED_POST_CREATED,
        userId,
        rewardValue: 1,
      });
    })
    .with({ eventType: EventType.EXTERNAL_VOLUNTEERING_OPPORTUNITY_STARTED }, async ({ userId }) => {
      await repo.create({
        rewardType: RewardType.EXTERNAL_VOLUNTEERING_OPPORTUNITY_STARTED,
        userId,
        rewardValue: 1,
      });
    })
    .with({ eventType: EventType.TASK_COMPLETED }, async ({ userId, data }) => {
      if (data.category !== "READY") {
        return;
      }
      await repo.create({
        rewardType: RewardType.TASK_COMPLETED,
        userId,
        rewardValue: 1,
      });
    })
    .otherwise(() => logger.info(`Message with eventType ${event.eventType} won't be handled`));

  await badges.unlockNewBadgesForUser(event.userId);

  return EventResponse.ack();
};

export const createHandler =
  (db: DbConnection): Handler =>
  (request) =>
    handler(request, db);
