import { ulid } from "ulid";
import { RewardType } from "../../types.ts";
import { schemaBuilder } from "./builder.ts";

export default schemaBuilder.toSchema({
  mocks: {
    Query: {
      counter: () => ({ counter: 10 }),
      globalCounter: () => ({ counter: 1000 }),
      transactions: () => ({
        totalResults: 1,
        data: [
          {
            id: ulid(),
            rewardType: RewardType.GOOD_DEED_POST_CREATED.toString(),
            createdAt: Temporal.Now.zonedDateTimeISO("UTC"),
          },
        ],
      }),
    },
  },
});
