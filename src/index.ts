import { STATUS_CODE, STATUS_TEXT } from "@std/http";
import { route } from "@std/http/unstable-route";
import routes from "./api/routes.ts";
import { configureLogger, getLogger } from "./logger.ts";

await configureLogger();
const logger = getLogger("serve");

Deno.serve(
  {
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
