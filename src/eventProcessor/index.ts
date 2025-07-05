import { Handler } from "@std/http/unstable-route";
import { STATUS_CODE, STATUS_TEXT, StatusCode } from "@std/http";
import {
  extractJwt,
  shouldSkipJwtVerification,
  verifyGoogleJWT,
} from "./jwt.ts";
import { EventType, PostCreatedPayload, PubSubEvent } from "./types.ts";
import { decodeBase64 } from "@std/encoding/base64";
import { match } from "ts-pattern";
import { TransactionRepository } from "../db/repository.ts";
import { RewardType } from "../types.ts";
import { getLogger } from "../logger.ts";

const logger = getLogger("eventProcessor");

const errorResponse = (code: StatusCode): Response =>
  Response.json({ error: STATUS_TEXT[code] }, { status: code });

const decodePayload = <PayloadType extends object>(
  data: string,
): PayloadType => {
  return JSON.parse(new TextDecoder().decode(
    decodeBase64(data),
  )) as PayloadType;
};

export const handler: Handler = async (request): Promise<Response> => {
  if (!shouldSkipJwtVerification()) {
    const jwt = extractJwt(request);
    if (!jwt) {
      return errorResponse(STATUS_CODE.Forbidden);
    }

    const jwtIsValid = await verifyGoogleJWT(jwt);
    if (!jwtIsValid) {
      logger.error("Could not verify JWT", { jwt });
      return errorResponse(STATUS_CODE.Forbidden);
    }
  }

  const body: PubSubEvent = await request.json();

  const { eventType, userId } = body.message.attributes;

  const repo = TransactionRepository.build();

  match(eventType)
    .with(EventType.CHALLENGE_SUBMITTED, async () => {
      await repo.create({
        rewardType: RewardType.CHALLENGE_SUBMITTED,
        userId,
        rewardValue: 1,
      });
    })
    .with(EventType.POST_CREATED, async () => {
      const payload = decodePayload<PostCreatedPayload>(body.message.data);
      if (payload.category !== "good_deeds") {
        return;
      }

      await repo.create({
        rewardType: RewardType.POST_CREATED,
        userId,
        rewardValue: 1,
      });
    })
    .exhaustive();

  return new Response(null, { status: STATUS_CODE.OK });
};
