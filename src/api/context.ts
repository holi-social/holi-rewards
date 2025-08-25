import type { YogaInitialContext } from "graphql-yoga";
import type { DbConnection } from "../db/connection.ts";

export interface GraphQLUserContext {
  db: DbConnection;
}

export interface GraphQLContext extends YogaInitialContext, GraphQLUserContext {}
