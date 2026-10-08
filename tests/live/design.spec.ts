import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  previewReports,
  previewState,
  previewViews,
  type PreviewRole,
} from "../../scripts/preview-data";

async function mockPlatform(page: Page, role: PreviewRole = "publico") {
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const allowed = path === "/api/state" || path === "/api/reports";
    await route.fulfill({
      status: allowed ? 200 : 403,
      contentType: "application/json",
      body: JSON.stringify(
        path === "/api/state"
          ? previewState(role)
          : path === "/api/reports"
            ? { items: previewReports }
            : {
                message: "Operação de teste recusada.",
                error: "Operação de teste recusada.",
              },
      ),
    });
  });
}
async function audit(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
}

test("busca mobile mostra resultados primeiro e preserva filtros ao recarregar e voltar", async ({
  page,
}) => {
  await mockPlatform(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/vagas");
  await expect(page.locator(".job-card")).toHaveCount(3);
  await expect(page.locator("#job-filters")).toBeHidden();
  await page.getByRole("button", { name: "Filtros", exact: true }).click();
  await page.getByLabel("Pagamento por", { exact: true }).selectOption("Dia");
  await expect(page).toHaveURL(/periodo=Dia/);
  await expect(page.locator(".job-card")).toHaveCount(1);
  await page.getByLabel("Valor mínimo (R$)").fill("200");
  await expect(
    page.getByRole("heading", { name: "Nenhuma vaga encontrada" }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Remover filtro: A partir de R$ 200",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Ver 1 resultado(s)", exact: true })
    .click();
  await expect(page.locator("#job-filters")).toBeHidden();
  await page.reload();
  await expect(page.locator(".job-card")).toHaveCount(1);
  await page
    .getByRole("link", { name: "Uma rotina de limpeza combinada", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Uma rotina de limpeza combinada",
  );
  await page.goBack();
  await expect(page).toHaveURL(/periodo=Dia/);
  await expect(page.locator(".job-card")).toHaveCount(1);
  await audit(page);
});

test("menu da conta fica recolhido no mobile, fecha com Escape e reconhece páginas filhas", async ({
  page,
}) => {
  await mockPlatform(page, "trabalhador");
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto("/painel");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Olá, Marina.",
  );
  await expect(page.locator("#workspace-navigation")).toBeHidden();
  const menu = page.getByRole("button", { name: "Menu da conta", exact: true });
  await menu.click();
  await expect(page.locator("#workspace-navigation")).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Sua área" })
      .getByRole("link", { name: "Visão geral", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(page.locator("#workspace-navigation")).toBeHidden();
  await menu.click();
  await page
    .getByRole("navigation", { name: "Sua área" })
    .getByRole("link", { name: "Meu histórico", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Histórico de trabalho",
  );
  await expect(page.locator("#workspace-navigation")).toBeHidden();
  await page.goto("/mensagens/00000000-0000-4000-8000-000000000100");
  await page
    .getByRole("button", { name: "Menu da conta", exact: true })
    .click();
  await expect(
    page
      .getByRole("navigation", { name: "Sua área" })
      .getByRole("link", { name: "Mensagens", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.keyboard.press("Escape");
  await expect(page.getByLabel("Mensagem", { exact: true })).toBeVisible();
  await page
    .getByRole("link", { name: "Todas as conversas", exact: true })
    .click();
  await expect(page.locator(".conversation-list")).toBeVisible();
  await expect(page.locator(".chat-panel")).toBeHidden();
});

test("falha inicial de conexão não vira estado vazio e permite tentar novamente", async ({
  page,
}) => {
  let failed = true;
  await page.route("**/api/state", (route) =>
    route.fulfill({
      status: failed ? 503 : 200,
      contentType: "application/json",
      body: JSON.stringify(
        failed
          ? { error: "Serviço temporariamente indisponível." }
          : previewState("publico"),
      ),
    }),
  );
  await page.goto("/vagas");
  await expect(
    page.getByRole("heading", {
      name: "Não foi possível carregar a plataforma",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Nenhuma vaga encontrada" }),
  ).toHaveCount(0);
  failed = false;
  await page
    .getByRole("button", { name: "Tentar novamente", exact: true })
    .click();
  await expect(page.locator(".job-card")).toHaveCount(3);
});

test("relatório mobile conserva todos os indicadores e identifica resultados com filtros antigos", async ({
  page,
}) => {
  await mockPlatform(page, "sindicato");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sindicato/relatorios");
  await page
    .getByRole("button", { name: "Gerar relatório", exact: true })
    .click();
  await expect(page.locator(".report-cards .report-card")).toHaveCount(2);
  await expect(page.locator(".report-table")).toBeHidden();
  const employer = page.locator(".report-card").filter({
    has: page.getByRole("heading", {
      name: "Empresa de exemplo",
      exact: true,
    }),
  });
  await employer.getByText("Ver todos os indicadores", { exact: true }).click();
  await expect(
    employer.getByText("Contratações informadas", { exact: true }),
  ).toBeVisible();
  await expect(
    employer.getByText("Sem avaliações", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Exportar CSV", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Data inicial", { exact: true }).fill("2026-09-01");
  await expect(
    page.getByText(/Filtros alterados\. Gere novamente/),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Exportar CSV", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Gerar relatório", exact: true })
    .click();
  await expect(
    page.getByText(/Filtros alterados\. Gere novamente/),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Exportar CSV", exact: true }),
  ).toHaveAttribute("href", /from=2026-09-01/);
  await audit(page);
});

test("acesso mantém senha oculta inicialmente e mostra falha junto ao formulário", async ({
  page,
}) => {
  await mockPlatform(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/entrar");
  const password = page.getByLabel("Senha", { exact: true });
  await expect(password).toHaveAttribute("type", "password");
  await page
    .getByRole("button", { name: "Mostrar senha", exact: true })
    .click();
  await expect(password).toHaveAttribute("type", "text");
  await page
    .getByRole("button", { name: "Ocultar senha", exact: true })
    .click();
  await expect(password).toHaveAttribute("type", "password");
  await page.getByLabel("E-mail", { exact: true }).fill("exemplo@example.test");
  await password.fill("Senha de exemplo 2026!");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.locator(".form-error")).toContainText(
    "Não foi possível entrar",
  );
  await expect(page.locator(".feedback-error")).toBeVisible();
  await expect(page.locator(".feedback-success")).toHaveCount(0);
  await audit(page);
});

test("confirmação de encerramento permite cancelar, usa foco seguro e conserva o erro no diálogo", async ({
  page,
}) => {
  await mockPlatform(page, "trabalhador");
  let mutations = 0;
  await page.route("**/api/actions", (route) => {
    mutations++;
    return route.fulfill({
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({
        error: "O registro mudou. Atualize antes de confirmar.",
      }),
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/trabalhador/historico");
  const trigger = page.getByRole("button", {
    name: "Confirmar encerramento",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Confirmar a data final?" });
  await expect(
    dialog.getByRole("button", { name: "Cancelar", exact: true }),
  ).toBeFocused();
  await audit(page);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(mutations).toBe(0);
  await trigger.click();
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  expect(mutations).toBe(0);
  await trigger.click();
  await dialog
    .getByRole("button", { name: "Confirmar encerramento", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toHaveText(
    "O registro mudou. Atualize antes de confirmar.",
  );
  await expect(dialog).toBeVisible();
  expect(mutations).toBe(1);
});

test("todas as telas de prévia cabem em desktop, tablet e celular sem exceções", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let role: PreviewRole = "publico";
  await page.route("**/api/state", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(previewState(role)),
    }),
  );
  await page.route("**/api/reports*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ items: previewReports }),
    }),
  );
  for (const view of previewViews) {
    role = view.role;
    await page.goto(view.path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByText("Carregando oportunidades…", { exact: true }),
    ).toHaveCount(0);
    if (view.profileKind)
      await page
        .getByLabel("Tipo de perfil", { exact: true })
        .selectOption(view.profileKind);
    if (view.path.endsWith("relatorios"))
      await page
        .getByRole("button", { name: "Gerar relatório", exact: true })
        .click();
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${view.role} ${view.path} ${width}`,
      ).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});
