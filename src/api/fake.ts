import { STATUS_CODE, STATUS_TEXT } from "@std/http";
import { METHOD } from "@std/http/unstable-method";
import { type Route, route } from "@std/http/unstable-route";
import { createYoga } from "graphql-yoga";
import fakeSchema from "./schema/fake.ts";

const yoga = createYoga({
  schema: fakeSchema,
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
    pattern: new URLPattern({ pathname: "/pubsub" }),
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
