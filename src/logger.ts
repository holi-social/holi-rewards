import {
  configure,
  getConsoleSink,
  getLogger as baseGetLogger,
} from "@logtape/logtape";

export const configureLogger = async () => {
  await configure({
    sinks: { console: getConsoleSink() },
    loggers: [
      { category: "holi-rewards", lowestLevel: "debug", sinks: ["console"] },
    ],
  });
};

export const getLogger = (...categories: string[]) =>
  baseGetLogger(["holi-rewards", ...categories]);
