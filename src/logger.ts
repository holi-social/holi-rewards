import {
  configure,
  getConsoleSink,
  getLogger as baseGetLogger,
} from "@logtape/logtape";

export const configureLogger = async () => {
  await configure({
    sinks: {
      console: getConsoleSink({
        formatter: (record) => JSON.stringify(record) + "\n",
      }),
    },
    loggers: [
      { category: ["holi-rewards"], lowestLevel: "debug", sinks: ["console"] },
      { category: ["logtape", "meta"], sinks: [] },
    ],
  });
};

export const getLogger = (...categories: string[]) =>
  baseGetLogger(["holi-rewards", ...categories]);
