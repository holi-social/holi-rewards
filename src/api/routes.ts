import { METHOD } from "@std/http/unstable-method";
import type { Route } from "@std/http/unstable-route";
import { createYoga } from "graphql-yoga";
import { createDbConnection, type DbConnection } from "../db/connection.ts";
import { createHandler as createEventsHandler } from "../eventProcessor/index.ts";
import { getLogger } from "../logger.ts";
import type { GraphQLUserContext } from "./context.ts";
import schema from "./schema.ts";

export default (dbConnection?: DbConnection): Route[] => {
  const db = dbConnection ?? createDbConnection();

  // biome-ignore lint/complexity/noBannedTypes: type shenanigans
  const yoga = createYoga<{}, GraphQLUserContext>({
    schema,
    logging: getLogger("yoga"),
    context: () => ({
      db,
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

  return [
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
      handler: createEventsHandler(db),
    },
  ];
};
