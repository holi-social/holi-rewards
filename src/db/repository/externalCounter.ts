import { desc } from "drizzle-orm/sql/expressions/select";
import { createDbConnection } from "../connection.ts";
import { externalCounterValue as externalCounterValueTable } from "../schema.ts";

export class ExternalCounterValueRepository {
  static build(): ExternalCounterValueRepository {
    return new ExternalCounterValueRepository(createDbConnection());
  }

  constructor(private readonly db: ReturnType<typeof createDbConnection>) {}

  async getLatestValue(): Promise<number> {
    const latest = await this.db
      .select()
      .from(externalCounterValueTable)
      .orderBy(desc(externalCounterValueTable.createdAt))
      .limit(1);

    return latest[0]?.externalCount ?? 0;
  }
}
