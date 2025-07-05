import type { Route } from "@std/http/unstable-route";
import { METHOD } from "@std/http/unstable-method";
import schema from "./schema.ts";
import { createYoga } from "graphql-yoga";
import { handler as pubsubHandler } from "../eventProcessor/index.ts";
import { getLogger } from "../logger.ts";

const yoga = createYoga({
  schema,
  logging: getLogger("yoga"),
  graphiql: {
    defaultHeaders: JSON.stringify({
      "X-Holi-User-ID": "00000000-0000-0000-0000-000000000000",
    }),
    defaultQuery: `
      query {
        counter {
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
    pattern: new URLPattern({ pathname: "/pubsub" }),
    method: [METHOD.Post],
    handler: pubsubHandler,
  },
] satisfies Route[];
