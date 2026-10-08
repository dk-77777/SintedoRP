import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { Pool } from "pg";
import nodemailer from "nodemailer";

/** Read-only: verifies applied migration names and their original checksums. */
export async function verifyDeploymentDatabase(
  connectionString: string,
  migrationsDir = resolve("migrations"),
) {
  const db = new Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 5000,
    statement_timeout: 5000,
  });
  try {
    const applied = (
      await db.query<{ name: string; checksum: string }>(
        "SELECT name,checksum FROM schema_migration",
      )
    ).rows;
    const names = (await readdir(migrationsDir))
      .filter((name) => name.endsWith(".sql"))
      .sort();
    if (!names.length) throw new Error("MIGRATIONS_UNAVAILABLE");
    const expected = await Promise.all(
      names.map(async (name) => ({
        name,
        checksum: createHash("sha256")
          .update(await readFile(resolve(migrationsDir, name)))
          .digest("hex"),
      })),
    );
    if (
      applied.length !== expected.length ||
      expected.some(
        (item) =>
          !applied.some(
            (row) => row.name === item.name && row.checksum === item.checksum,
          ),
      )
    )
      throw new Error("MIGRATIONS_MISMATCH");
  } finally {
    await db.end();
  }
}

/** SMTP verification connects/authenticates only; it sends no message. */
export async function verifyDeploymentSMTP(url: string) {
  const transport = nodemailer.createTransport({
    url,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
    logger: false,
    debug: false,
  });
  try {
    await transport.verify();
  } finally {
    transport.close();
  }
}
