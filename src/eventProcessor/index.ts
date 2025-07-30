import { decodeBase64 } from "@std/encoding/base64";
import { STATUS_CODE, STATUS_TEXT, type StatusCode } from "@std/http";
import type { Handler } from "@std/http/unstable-route";
import { match } from "ts-pattern";
import { TransactionRepository } from "../db/repository.ts";
import { FeatureFlag, FeatureFlags } from "../featureFlag.ts";
import { getLogger } from "../logger.ts";
import { RewardType } from "../types.ts";
import {
  extractJwt,
  shouldSkipJwtVerification,
  verifyGoogleJWT,
} from "./jwt.ts";
import {
  EventType,
  type FeedPostCreatedPayload,
  type PubSubEvent,
} from "./types.ts";

const logger = getLogger("eventProcessor");

const decodePayload = <PayloadType extends object>(
  data: string,
): PayloadType => {
  return JSON.parse(
    new TextDecoder().decode(decodeBase64(data)),
  ) as PayloadType;
};

const featureFlags = FeatureFlags.build();

const PubsubResponse = {
  ack: () => Response.json({ ok: true }, { status: STATUS_CODE.OK }),
  nack: (status: StatusCode) =>
    Response.json({ ok: false, error: STATUS_TEXT[status] }, { status }),
};

export const handler: Handler = async (request): Promise<Response> => {
  if (!shouldSkipJwtVerification()) {
    const jwt = extractJwt(request);
    if (!jwt) {
      return PubsubResponse.nack(STATUS_CODE.Forbidden);
    }

    const jwtIsValid = await verifyGoogleJWT(jwt);
    if (!jwtIsValid) {
      logger.error("Could not verify JWT", { jwt });
      return PubsubResponse.nack(STATUS_CODE.Forbidden);
    }
  }

  const body: PubSubEvent = await request.json();

  const { eventType, userId } = body.message.attributes;
  if (!userId) {
    logger.debug("Event without userId, not meant for us");
    return PubsubResponse.ack();
  }

  const isFeatureFlagEnabled = await featureFlags.isEnabled(
    FeatureFlag.PHASE_1,
    userId,
  );
  if (!isFeatureFlagEnabled) {
    logger.info("Feature flag is not enabled for user {userId}", { userId });
    return PubsubResponse.ack();
  }

  const repo = TransactionRepository.build();

  match(eventType)
    .with(EventType.CHALLENGE_SUBMITTED, async () => {
      await repo.create({
        rewardType: RewardType.CHALLENGE_SUBMITTED,
        userId,
        rewardValue: 1,
      });
    })
    .with(EventType.FEED_POST_CREATED, async () => {
      const payload = decodePayload<FeedPostCreatedPayload>(body.message.data);
      if (payload.category !== "good-deed") {
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
    .otherwise(() =>
      logger.info(`Message with eventType ${eventType} won't be handled`),
    );

  return PubsubResponse.ack();
};
