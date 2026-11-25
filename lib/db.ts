import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;

export const sql = url ? neon(url) : null;

export async function dbOk(): Promise<boolean> {
  if (!sql) return false;
  try {
    await sql`select 1`;
    return true;
  } catch {
    return false;
  }
}
