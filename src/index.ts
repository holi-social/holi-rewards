import { STATUS_CODE, STATUS_TEXT } from "@std/http";
import { route } from "@std/http/unstable-route";
import fakeServer from "./api/fake.ts";
import routes from "./api/routes.ts";
import { configureLogger, getLogger } from "./logger.ts";

await configureLogger();
const logger = getLogger("serve");
const port = parseInt(Deno.env.get("PORT") ?? "8000", 10);

if (Deno.env.get("FAKE") === "true") {
  Deno.serve(
    {
      port,
      onListen: () => {
        logger.info`holi-rewards FAKE server started`;
      },
    },
    fakeServer,
  );
} else {
  Deno.serve(
    {
      port,
      onListen: () => {
        logger.info`holi-rewards server started`;
      },
    },
    route(
      routes,
      () =>
        Response.json(
          { error: STATUS_TEXT[STATUS_CODE.NotFound] },
          {
            status: STATUS_CODE.NotFound,
          },
        ), // default handler
    ),
  );
}
