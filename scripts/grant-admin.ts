import { existsSync } from "node:fs";
import { Pool } from "pg";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const [email, role = "ADMIN"] = process.argv.slice(2);
if (!email || !["ADMIN", "MODERATOR", "ANALYST"].includes(role))
  throw new Error("Uso: npm run admin:grant -- email ADMIN|MODERATOR|ANALYST");
const db = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await db.connect();
try {
  await client.query("BEGIN");
  const user = (
    await client.query(
      'SELECT id,"emailVerified",suspended FROM "user" WHERE lower(email)=lower($1)',
      [email],
    )
  ).rows[0];
  if (!user?.emailVerified || user.suspended)
    throw new Error(
      "A conta precisa existir, estar ativa e ter e-mail confirmado.",
    );
  await client.query(
    "INSERT INTO role_grant(user_id,role,granted_by) VALUES($1,$2,$1) ON CONFLICT DO NOTHING",
    [user.id, role],
  );
  await client.query(
    "INSERT INTO audit_event(actor_id,action,resource) VALUES($1,$2,$1)",
    [user.id, `CLI: concessão de ${role} pelo operador`],
  );
  await client.query(
    'UPDATE "user" SET "currentRole"=\'sindicato\',"updatedAt"=now() WHERE id=$1',
    [user.id],
  );
  await client.query("COMMIT");
  console.log("Permissão sindical concedida à conta existente.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await db.end();
}
