import { Handler } from "@std/http/unstable-route";
import { STATUS_CODE } from "@std/http";
import { HEADER } from "@std/http/unstable-header";
import { verifyGoogleJWT } from "./jwt.ts";
import { EventType, PostCreatedPayload, PubSubEvent } from "./types.ts";
import { decodeBase64 } from "@std/encoding/base64";
import { match } from "ts-pattern";
import { TransactionRepository } from "../db/repository.ts";
import { RewardType } from "../types.ts";

const extractJwt = (request: Request): string | undefined => {
  const header = request.headers.get(HEADER.Authorization);
  if (!header) return undefined;

  const match = header.match(/^Bearer (.+)$/i);
  if (!match) return undefined;

  return match[1];
};

const errorResponse = (message: string, code: number): Response =>
  Response.json({ error: message }, { status: code });

const decodePayload = <PayloadType extends object>(
  data: string,
): PayloadType => {
  return JSON.parse(new TextDecoder().decode(
    decodeBase64(data),
  )) as PayloadType;
};

export const handler: Handler = async (request): Promise<Response> => {
  const jwt = extractJwt(request);
  if (!jwt) {
    return errorResponse("Bad authorization", STATUS_CODE.Forbidden);
  }

  const jwtIsValid = await verifyGoogleJWT(jwt);
  if (!jwtIsValid) return errorResponse("Invalid JWT", STATUS_CODE.Forbidden);

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
