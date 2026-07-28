import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run migrations.");
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const migrationDirectory = join(scriptDirectory, "..", "drizzle");
const files = (await readdir(migrationDirectory))
  .filter((file) => /^\d+_.+\.sql$/.test(file))
  .sort();

if (files.length === 0) throw new Error("No SQL migrations found.");

const sql = postgres(process.env.DATABASE_URL, { prepare: false });
try {
  for (const file of files) {
    console.log(`Applying ${file}`);
    await sql.begin(async (transaction) => {
      await transaction.unsafe(await readFile(join(migrationDirectory, file), "utf8"));
    });
  }
  console.log(`Applied ${files.length} migration${files.length === 1 ? "" : "s"}.`);
} finally {
  await sql.end({ timeout: 5 });
}
