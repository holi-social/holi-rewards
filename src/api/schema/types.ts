import type { Resolver as PothosResolver } from "@pothos/core";
import type { YogaInitialContext } from "graphql-yoga";
import type { RewardType } from "../../types.ts";
import type { schemaBuilder } from "./builder.ts";

export type BuilderTypes = typeof schemaBuilder.$inferSchemaTypes;

export interface RewardsCounter {
  counter: number | null;
}

export interface Transaction {
  id: string;
  rewardType: RewardType;
  createdAt: Temporal.ZonedDateTime;
}

export interface Paged<T> {
  data: T[];
  totalResults: number;
}

export type Resolver<
  Return,
  Args = Record<string, never>,
  Parent = unknown,
> = PothosResolver<Parent, Args, YogaInitialContext, Return>;
