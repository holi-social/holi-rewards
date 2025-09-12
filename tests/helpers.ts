import { randomIntegerBetween } from "@std/random";

export const randomTimestampInLastWeek = () =>
  Temporal.Now.zonedDateTimeISO("UTC").subtract({
    minutes: randomIntegerBetween(0, 7 * 24 * 60),
  });
