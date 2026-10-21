import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";
import { previewState } from "../../scripts/preview-data";

const fixture = previewState("publico");
async function ready(page: Page) {
  await page.goto("/");
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
}

for (const width of [1440, 390]) {
  test(`atalhos, apoio e vagas navegam por teclado em ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/api/state", (route) =>
      route.fulfill({ json: fixture }),
    );
    await ready(page);
    const links = await page
      .locator(
        ".home-paths > a, .opportunity-row, .home-union-copy > .home-button, .home-resources > a",
      )
      .evaluateAll((items) =>
        items.map((item) => ({
          href: item.getAttribute("href")!,
          text: item.textContent!.trim(),
        })),
      );
    expect(links).toHaveLength(10);
    for (const [index, { href, text }] of links.entries()) {
      await ready(page);
      const target = page
        .locator(
          ".home-paths > a, .opportunity-row, .home-union-copy > .home-button, .home-resources > a",
        )
        .nth(index);
      await expect(target).toHaveText(text);
      await target.focus();
      await expect(target).toBeFocused();
      expect(
        await target.evaluate((el) => getComputedStyle(el).outlineStyle),
      ).not.toBe("none");
      await page.keyboard.press("Enter");
      await expect
        .poll(() => {
          const url = new URL(page.url());
          return url.pathname + url.search;
        })
        .toBe(href);
      await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const job = fixture.jobs.find((item) => href === `/vagas/${item.id}`);
      if (job)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
          job.title,
        );
    }
  });

  test(`categorias preservam filtros e resultados em ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/api/state", (route) =>
      route.fulfill({ json: fixture }),
    );
    for (const category of [
      "Doméstica",
      "Diarista",
      "Babá",
      "Cuidador de idosos",
    ]) {
      await ready(page);
      await page
        .locator(".care-categories")
        .getByRole("link", { name: category, exact: true })
        .click();
      await expect
        .poll(() => new URL(page.url()).searchParams.get("funcao"))
        .toBe(category);
      const expected = fixture.jobs.filter((job) => job.category === category);
      await expect(page.locator(".job-card")).toHaveCount(expected.length);
      for (const job of expected)
        await expect(page.locator(".job-card")).toContainText(job.title);
      await page
        .getByRole("button", {
          name: `Remover filtro: ${category}`,
          exact: true,
        })
        .click();
      await expect(page.locator(".job-card")).toHaveCount(fixture.jobs.length);
    }
  });
}

test("falha oferece uma ação e recupera vagas sem navegação", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  let attempts = 0;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/state", async (route) => {
    attempts++;
    if (attempts === 1)
      return route.fulfill({
        status: 503,
        json: { error: "Falha de conexão." },
      });
    await pending;
    await route.fulfill({ json: fixture });
  });
  await ready(page);
  const empty = page.locator(".opportunities-empty");
  await expect(empty.getByRole("heading")).toHaveText(
    "Oportunidades indisponíveis no momento.",
  );
  await expect(empty.locator("a, svg")).toHaveCount(0);
  const retry = empty.getByRole("button", {
    name: "Tentar novamente",
    exact: true,
  });
  await retry.focus();
  await page.keyboard.press("Enter");
  await expect(empty.getByRole("button")).toBeDisabled();
  await expect(empty).toHaveAttribute("aria-busy", "true");
  release();
  await expect(page.locator(".opportunity-row")).toHaveCount(3);
  await expect(empty).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);
});

test("carregamento e ausência de vagas mantêm orientação e cadastro", async ({
  page,
}) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/state", async (route) => {
    await pending;
    await route.fulfill({ json: { ...fixture, jobs: [] } });
  });
  await page.goto("/");
  const empty = page.locator(".opportunities-empty");
  await expect(empty.getByRole("heading")).toHaveText(
    "Carregando oportunidades…",
  );
  await expect(empty.locator("a, button, svg")).toHaveCount(0);
  release();
  await expect(empty.getByRole("heading")).toHaveText(
    "Nenhuma vaga publicada no momento.",
  );
  const audit = await new AxeBuilder({ page })
    .include(".portal-content")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  await expect(empty).toContainText(
    "crie seu perfil para se candidatar quando houver vagas",
  );
  await expect(page.locator(".care-categories")).toHaveCount(0);
  await empty
    .getByRole("link", { name: "Criar meu perfil", exact: true })
    .click();
  await expect(page).toHaveURL(/\/cadastro$/);
});
