import { randomUUID } from "node:crypto";
import { STATUS_CODE, STATUS_TEXT } from "@std/http";
import { METHOD } from "@std/http/unstable-method";
import { type Route, route } from "@std/http/unstable-route";
import { createSchema, createYoga } from "graphql-yoga";
import { DateTimeISOResolver } from "./resolvers/datetime.ts";
import type { mutations, queries } from "./resolvers/index.ts";
import { schemaTypes } from "./schema.ts";

const yoga = createYoga({
  schema: createSchema({
    typeDefs: schemaTypes,
    resolvers: {
      DateTimeISO: DateTimeISOResolver,
      Query: {
        counter: () => Promise.resolve({ counter: 10 }),
        globalCounter: () => Promise.resolve({ counter: 100 }),
        transactions: () =>
          Promise.resolve({
            totalResults: 0,
            data: [],
          }),
        badges: () =>
          Promise.resolve({
            unlocked: [],
            inProgress: [],
          }),
      } satisfies typeof queries,

      Mutation: {
        markBadgeUnlockAsSeen: () =>
          Promise.resolve({
            id: randomUUID(),
            slug: "WellDoneBadge",
            unlockedAt: Temporal.Now.zonedDateTimeISO(),
          }),
      } satisfies typeof mutations,
    },
  }),
});

const routes: Route[] = [
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
    handler: () => Response.json({ ok: true }, { status: STATUS_CODE.OK }),
  },
];

export default route(routes, () =>
  Response.json(
    { error: STATUS_TEXT[STATUS_CODE.NotFound] },
    {
      status: STATUS_CODE.NotFound,
    },
  ),
);
