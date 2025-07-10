import {
  getLogger as baseGetLogger,
  configure,
  getConsoleSink,
  jsonLinesFormatter,
} from "@logtape/logtape";
import { prettyFormatter } from "@logtape/pretty";

const isDevelopment = Deno.env.get("NODE_ENV") === "development";

export const configureLogger = async () => {
  await configure({
    sinks: {
      console: getConsoleSink({
        formatter: isDevelopment ? prettyFormatter : jsonLinesFormatter,
      }),
    },
    loggers: [
      {
        category: ["holi-rewards"],
        lowestLevel: isDevelopment ? "trace" : "info",
        sinks: ["console"],
      },
      { category: ["logtape", "meta"], sinks: [] },
    ],
  });
};

export const getLogger = (...categories: string[]) =>
  baseGetLogger(["holi-rewards", ...categories]);
