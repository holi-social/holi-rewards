import { reset } from "drizzle-seed";
import { createDbConnection } from "../connection.ts";
import * as schema from "../schema.ts";

const db = createDbConnection();
await reset(db, schema);

console.log("Database reset!");
