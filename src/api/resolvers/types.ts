import type { YogaInitialContext } from "graphql-yoga";

export type Paged<TData> = {
  data: TData[];
  totalResults: number;
};

export type Resolver<Return, Args = Record<string, never>, Context = YogaInitialContext, Root = never> = (
  root: Root,
  args: Args,
  context: Context,
) => Promise<Return>;
