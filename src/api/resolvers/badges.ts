import { BadgesService } from "../../badges/index.ts";
import type { InProgressBadge, UnlockedBadge } from "../../badges/types.ts";
import { authenticatedUser } from "./helpers.ts";
import type { Resolver } from "./types.ts";

type BadgesOverview = {
  unlocked: UnlockedBadge[];
  inProgress: InProgressBadge[];
};

const resolver: Resolver<BadgesOverview> = async (_, _args, { request }) => {
  const userId = authenticatedUser(request);
  const badges = BadgesService.build();

  return {
    unlocked: await badges.getUnlockedBadgesForUser(userId),
    inProgress: await badges.getProgressForUser(userId),
  };
};

export default resolver;
