import { YogaInitialContext } from "graphql-yoga";
import { TransactionRepository } from "../../db/repository.ts";

const USER_ID_HEADER = "X-Holi-User-ID";

const resolver = async (
  _: never,
  _args: Record<string, never>,
  { request }: YogaInitialContext,
): Promise<{ counter: number | null }> => {
  const repo = TransactionRepository.build();

  const userId = request.headers.get(USER_ID_HEADER);
  if (!userId || userId === "anonymous") {
    throw new Error(
      "User is not authenticated",
    );
  }

  const counter = await repo.getCounterForUser(userId);
  return { counter };
};

export default resolver;
