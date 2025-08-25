import type { GraphQLContext } from "../context.ts";

export type Paged<TData> = {
  data: TData[];
  totalResults: number;
};

export type Resolver<Return, Args = Record<string, never>, Context = GraphQLContext, Root = never> = (
  root: Root,
  args: Args,
  context: Context,
) => Promise<Return>;
