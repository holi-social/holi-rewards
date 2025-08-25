import { METHOD } from "@std/http/unstable-method";
import type { Route } from "@std/http/unstable-route";
import { createYoga } from "graphql-yoga";
import { createDbConnection } from "../db/connection.ts";
import { handler as eventsHandler } from "../eventProcessor/index.ts";
import { getLogger } from "../logger.ts";
import type { GraphQLUserContext } from "./context.ts";
import schema from "./schema.ts";

// biome-ignore lint/complexity/noBannedTypes: type shenanigans
const yoga = createYoga<{}, GraphQLUserContext>({
  schema,
  logging: getLogger("yoga"),
  context: () => ({
    db: createDbConnection(),
  }),
  graphiql: {
    defaultHeaders: JSON.stringify({
      "X-Holi-User-ID": "00000000-0000-0000-0000-000000000000",
    }),
    defaultQuery: `
      query {
        counter {
          counter
        } 

        globalCounter {
          counter
        }
      }
    `,
  },
});

export default [
  {
    pattern: new URLPattern({ pathname: "/graphql" }),
    method: [METHOD.Get, METHOD.Post],
    handler: (request) => {
      return yoga(request);
    },
  },
  {
    pattern: new URLPattern({ pathname: "/health" }),
    method: [METHOD.Get],
    handler: (request) => {
      return yoga(request);
    },
  },
  {
    pattern: new URLPattern({ pathname: "/events" }),
    method: [METHOD.Post],
    handler: eventsHandler,
  },
] satisfies Route[];
