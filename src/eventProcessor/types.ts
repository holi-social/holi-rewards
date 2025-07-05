export enum EventType {
  CHALLENGE_SUBMITTED = "ChallengeSubmitted",
  POST_CREATED = "PostCreated",
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

export type PostCreatedPayload = {
  category: string;
};
