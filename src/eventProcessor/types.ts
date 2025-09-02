export enum EventType {
  CHALLENGE_SUBMITTED = "ChallengeSubmitted",
  FEED_POST_CREATED = "FeedPostCreated",
  EXTERNAL_VOLUNTEERING_OPPORTUNITY_STARTED = "ExternalVolunteeringOpportunityStarted",
  TASK_COMPLETED = "TaskCompleted",
}

export type MessageAttributes = {
  eventType: EventType;
  userId: string;
};

export type PubSubEvent = {
  message: {
    attributes: MessageAttributes;
    data: string; // base64 encoded data
    messageId: string;
    orderingKey: string;
    publishTime: string;
  };

  deliveryAttempt: number;
  subscription: string;
};

export type ChallengeSubmittedPayload = Record<PropertyKey, never>;

export type FeedPostCreatedPayload = {
  category: string;
};

export type TaskCompletedPayload = {
  category: string;
};
