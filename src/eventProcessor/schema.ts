import * as v from "@valibot/valibot";

export enum EventType {
  CHALLENGE_SUBMITTED = "ChallengeSubmitted",
  FEED_POST_CREATED = "FeedPostCreated",
  EXTERNAL_VOLUNTEERING_OPPORTUNITY_STARTED = "ExternalVolunteeringOpportunityStarted",
  TASK_COMPLETED = "TaskCompleted",
}

const emptyPayloadSchema = v.optional(v.object({}));
const feedPostCreatedPayloadSchema = v.object({
  category: v.pipe(v.string(), v.nonEmpty()),
});
const taskCompletedPayloadSchema = v.object({
  category: v.pipe(v.string(), v.nonEmpty()),
});

const metadataSchema = v.object({
  userId: v.pipe(v.string(), v.uuid()),
});

const eventSchema = v.variant("eventType", [
  v.object({
    ...metadataSchema.entries,
    eventType: v.literal(EventType.FEED_POST_CREATED),
    data: feedPostCreatedPayloadSchema,
  }),
  v.object({
    ...metadataSchema.entries,
    eventType: v.literal(EventType.TASK_COMPLETED),
    data: taskCompletedPayloadSchema,
  }),
  v.object({
    ...metadataSchema.entries,
    eventType: v.picklist([EventType.CHALLENGE_SUBMITTED, EventType.EXTERNAL_VOLUNTEERING_OPPORTUNITY_STARTED]),
    data: emptyPayloadSchema,
  }),
]);

export type Event = v.InferOutput<typeof eventSchema>;

export const safeParseEvent = (input: unknown) => v.safeParse(eventSchema, input);
