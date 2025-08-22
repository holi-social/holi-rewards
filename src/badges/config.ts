import { RewardType } from "../types.ts";
import { firstTimeBadge, repeatedActionBadge } from "./helpers.ts";
import type { BadgeConfig } from "./types.ts";

const allBadges: BadgeConfig[] = [
  firstTimeBadge("impact.spark", RewardType.EXTERNAL_VOLUNTEERING_OPPORTUNITY_STARTED),
  firstTimeBadge("story.spark", RewardType.GOOD_DEED_POST_CREATED),

  repeatedActionBadge("impact.explorer", RewardType.EXTERNAL_VOLUNTEERING_OPPORTUNITY_STARTED, 5),
  repeatedActionBadge("story.explorer", RewardType.GOOD_DEED_POST_CREATED, 5),
] as const;

export default allBadges;
