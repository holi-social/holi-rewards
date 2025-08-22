import badges from "./badges.ts";
import counter from "./counter.ts";
import globalCounter from "./globalCounter.ts";
import markBadgeUnlockAsSeen from "./markBadgeUnlockAsSeen.ts";
import transactions from "./transactions.ts";

export const queries = {
  transactions,
  counter,
  globalCounter,
  badges,
};

export const mutations = {
  markBadgeUnlockAsSeen,
};
