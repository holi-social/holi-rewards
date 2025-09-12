import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { fail } from "@std/assert";
import { createYoga } from "graphql-yoga";
import schema from "../../src/api/schema.ts";
import type { TestDbConnection } from "../db/helpers.ts";

export const createTestSchema = (db: TestDbConnection) =>
  createYoga({
    schema,
    context: { db },
  });

export const createTestClient = (db: TestDbConnection, userId?: string) => {
  const yoga = createTestSchema(db);
  return buildHTTPExecutor({
    fetch: yoga.fetch,
    endpoint: `http://yoga/graphql`,
    headers: userId
      ? {
          "X-Holi-User-Id": userId,
        }
      : {},
  });
};

export function assertSingleValue<TValue extends object>(
  value: TValue | AsyncIterable<TValue>,
): asserts value is TValue {
  if (Symbol.asyncIterator in value) {
    fail("Expected single value");
  }
}
