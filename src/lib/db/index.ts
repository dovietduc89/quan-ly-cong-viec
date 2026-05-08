import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_, prop) {
    const instance = createDb();
    return (instance as unknown as Record<string | symbol, unknown>)[prop];
  },
});
