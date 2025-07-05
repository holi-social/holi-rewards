import { route } from "@std/http/unstable-route";
import routes from "./routes.ts";
import { configureLogger } from "../logger.ts";
import { STATUS_CODE } from "@std/http";

await configureLogger();

Deno.serve(
  route(
    routes,
    () => new Response("Not found", { status: STATUS_CODE.NotFound }), // default handler
  ),
);
