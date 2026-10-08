import { test, expect } from "@playwright/test";
import {
  readFile,
  readdir,
  mkdtemp,
  cp,
  appendFile,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  verifyDeploymentDatabase,
  verifyDeploymentSMTP,
} from "../../scripts/deployment-services";

test.describe("Implantação: verificação de serviços sem alterações", () => {
  test("confere checksums no banco temporário e detecta SQL alterado sem reaplicar migrações", async () => {
    const fixture = JSON.parse(await readFile(".local/e2e-env.json", "utf8"));
    const url = new URL(fixture.databaseURL);
    if (
      !["localhost", "127.0.0.1"].includes(url.hostname) ||
      !/^\/sintedorp_e2e_[a-f0-9]+$/.test(url.pathname)
    )
      throw new Error("Os checks exigem o banco temporário local.");
    await expect(
      verifyDeploymentDatabase(fixture.databaseURL),
    ).resolves.toBeUndefined();
    const copy = await mkdtemp(join(tmpdir(), "sintedorp-migrations-"));
    try {
      await cp("migrations", copy, { recursive: true });
      const migration = (await readdir(copy)).find((name) =>
        name.endsWith(".sql"),
      )!;
      await appendFile(
        join(copy, migration),
        "\n-- Simulação de SQL alterado após aplicação.\n",
      );
      await expect(
        verifyDeploymentDatabase(fixture.databaseURL, copy),
      ).rejects.toThrow("MIGRATIONS_MISMATCH");
      // The checker only reads metadata: the original database still verifies.
      await expect(
        verifyDeploymentDatabase(fixture.databaseURL),
      ).resolves.toBeUndefined();
    } finally {
      await rm(copy, { recursive: true, force: true });
    }
  });

  test("verifica conexão SMTP local sem criar mensagem na caixa de teste", async () => {
    const count = async () => {
      const response = await fetch(
        "http://127.0.0.1:8025/api/v1/messages?limit=1",
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.total).toEqual(expect.any(Number));
      return data.total;
    };
    const before = await count();
    await expect(
      verifyDeploymentSMTP("smtp://127.0.0.1:1025"),
    ).resolves.toBeUndefined();
    expect(await count()).toBe(before);
  });
});
