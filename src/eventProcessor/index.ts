import { STATUS_CODE, STATUS_TEXT, type StatusCode } from "@std/http";
import type { Handler } from "@std/http/unstable-route";
import { match } from "ts-pattern";
import { BadgesService } from "../badges/index.ts";
import { createDbConnection } from "../db/connection.ts";
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

export const handler: Handler = async (request): Promise<Response> => {
  const parseResult = safeParseEvent(await request.json());
  if (!parseResult.success) {
    logger.info("Failed to parse event", { event: parseResult });
    return EventResponse.nack(STATUS_CODE.BadRequest);
  }

  logger.info("Event parsed successfully", { event: parseResult.output });

  const { userId, eventType, data } = parseResult.output;

  const isFeatureFlagEnabled = await featureFlags.isEnabled(FeatureFlag.PHASE_1, userId);
  if (!isFeatureFlagEnabled) {
    logger.info("Feature flag is not enabled for user {userId}", { userId });
    return EventResponse.ack();
  }

  const dbConnection = createDbConnection();
  const repo = new TransactionRepository(dbConnection);
  const badges = BadgesService.build(dbConnection);

  match(eventType)
    .with(EventType.CHALLENGE_SUBMITTED, async () => {
      await repo.create({
        rewardType: RewardType.CHALLENGE_SUBMITTED,
        userId,
        rewardValue: 1,
      });
    })
    .with(EventType.FEED_POST_CREATED, async () => {
      if (data.category !== "good-deed") {
        return;
      }

      await repo.create({
        rewardType: RewardType.GOOD_DEED_POST_CREATED,
        userId,
        rewardValue: 1,
      });
    })
    .with(EventType.EXTERNAL_VOLUNTEERING_OPPORTUNITY_STARTED, async () => {
      await repo.create({
        rewardType: RewardType.EXTERNAL_VOLUNTEERING_OPPORTUNITY_STARTED,
        userId,
        rewardValue: 1,
      });
    })
    .with(EventType.TASK_COMPLETED, async () => {
      if (data.category !== "READY") {
        return;
      }
      await repo.create({
        rewardType: RewardType.TASK_COMPLETED,
        userId,
        rewardValue: 1,
      });
    })
    .otherwise(() => logger.info(`Message with eventType ${eventType} won't be handled`));

  await badges.unlockNewBadgesForUser(userId);

  return EventResponse.ack();
};
