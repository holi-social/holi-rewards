import { PostHog } from "posthog-node";
import { requireEnv } from "./utils.ts";

const apiKey = () => requireEnv("POSTHOG_API_KEY");

const createPosthogClient = () => {
  return new PostHog(apiKey(), {
    defaultOptIn: false,
    host: "https://eu.i.posthog.com",
  });
};

export enum FeatureFlag {
  PHASE_1 = "rewards-phase-1",
}

const defaults: Record<FeatureFlag, boolean> = {
  [FeatureFlag.PHASE_1]: false,
};

export class FeatureFlags {
  static build(): FeatureFlags {
    return new FeatureFlags(createPosthogClient());
  }

  constructor(private readonly posthog: PostHog) {}

  async isEnabled(flag: FeatureFlag, userId: string): Promise<boolean> {
    return (await this.posthog.isFeatureEnabled(flag, userId)) ?? defaults[flag];
  }
}
