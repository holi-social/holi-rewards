import { createGraphQLError } from "graphql-yoga";
import { getLogger } from "../../logger.ts";

const USER_ID_HEADER = "X-Holi-User-ID";

export const authenticatedUser = (request: Request): string => {
  const userId = request.headers.get(USER_ID_HEADER);

  if (!userId || userId === "anonymous") {
    getLogger("graphql", "auth").error("Could not resolve user from request", { request });
    throw createGraphQLError("User is not authenticated");
  }

  return userId;
};
