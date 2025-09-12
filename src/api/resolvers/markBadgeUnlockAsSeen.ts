import { createGraphQLError } from "graphql-yoga";
import { BadgesService } from "../../badges/index.ts";
import type { UnlockedBadge } from "../../badges/types.ts";
import { getLogger } from "../../logger.ts";
import { authenticatedUser } from "./helpers.ts";
import type { Resolver } from "./types.ts";

const logger = getLogger("graphql", "markBadgeUnlockAsSeen");

const resolver: Resolver<UnlockedBadge, { unlockId: string }> = async (_, { unlockId }, { request, db }) => {
  const userId = authenticatedUser(request);
  const badges = BadgesService.build(db);

  try {
    return await badges.markBadgeUnlockAsSeen(userId, unlockId);
  } catch (err) {
    logger.error("Could not mark badge unlock as seen", { err });
    throw createGraphQLError(`Unlock with ID "${unlockId}" not found`);
  }
};

export default resolver;
