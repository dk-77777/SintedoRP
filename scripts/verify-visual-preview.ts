import { chromium, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { previewViews } from "./preview-data";

const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? "/usr/bin/chromium",
  headless: true,
});
try {
  const page = await browser.newPage({
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
  });
  const errors: string[] = [],
    requests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route(/^https?:/, (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  const source = await readFile(
    resolve("artifacts/previa-visual/Conecta-SINTEDORP-previa.html"),
    "utf8",
  );
  // Same HTML bytes, with no local file navigation or external network access.
  await page.goto("about:blank");
  await page.setContent(source);
  const views = await page.locator("#preview-data").evaluate(
    (node) =>
      JSON.parse(node.textContent ?? "[]") as {
        role: string;
        path: string;
      }[],
  );
  expect(views.length).toBe(previewViews.length);
  for (const view of views) {
    await page.locator("#preview-role").selectOption(view.role);
    await page
      .locator("#preview-view")
      .selectOption(view.role + "|" + view.path);
    await expect(page.locator("main#conteudo")).toHaveAttribute(
      "aria-busy",
      "false",
    );
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${view.role} ${view.path} ${width}`,
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 390, height: 960 });
  await page.locator("#preview-role").selectOption("trabalhador");
  await expect(page.locator("#workspace-navigation")).toBeHidden();
  await page
    .getByRole("button", { name: "Menu", exact: true })
    .click();
  await expect(page.locator("#workspace-navigation")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#workspace-navigation")).toBeHidden();
  await page
    .locator("#preview-view")
    .selectOption("trabalhador|/trabalhador/historico");
  await page
    .getByRole("button", { name: "Confirmar encerramento", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Confirmar a data final?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(dialog).toBeHidden();
  await page.locator("#preview-view").selectOption("trabalhador|/mensagens");
  await page
    .getByRole("navigation", { name: "Conversas", exact: true })
    .getByRole("link")
    .first()
    .click();
  await expect(page.locator(".chat-panel")).toBeVisible();
  await expect(page.locator(".conversation-list")).toBeHidden();
  await page
    .getByRole("link", { name: "Todas as conversas", exact: true })
    .click();
  await expect(page.locator(".conversation-list")).toBeVisible();
  await page.locator("#preview-role").selectOption("empregador");
  await page
    .locator("#preview-view")
    .selectOption("empregador|/cadastro/perfil?tipo=PF");
  await expect(page.getByLabel("CPF", { exact: true })).toBeVisible();
  await page
    .locator("#preview-view")
    .selectOption("empregador|/cadastro/perfil?tipo=PJ");
  await expect(page.getByLabel("CNPJ", { exact: true })).toBeVisible();
  await page.locator("#preview-role").selectOption("publico");
  await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
  await expect(page.locator(".header-nav")).toHaveClass(/open/);
  await page
    .getByRole("link", { name: "Vagas", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Filtros", exact: true }).click();
  await expect(page.locator("#job-filters")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#job-filters")).toBeHidden();
  await page.locator("#preview-view").selectOption("publico|/entrar");
  await page
    .getByRole("button", { name: "Mostrar senha", exact: true })
    .click();
  await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page
    .getByRole("button", { name: "Ocultar senha", exact: true })
    .click();
  await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute(
    "type",
    "password",
  );
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.locator("#preview-help")).toBeVisible();
  await page.goto("about:blank");
  await page.setContent(source);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 960 });
    await page.screenshot({
      path: resolve("artifacts/previa-visual", `arquivo-aberto-${width}.png`),
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
  expect(requests).toEqual([]);
  console.log(
    `${views.length} telas verificadas em 360, 768 e 1440 px; menus, diálogos, conversas, CPF/CNPJ e senha passaram. Zero exceções JavaScript e zero requisições HTTP.`,
  );
} finally {
  await browser.close();
}
