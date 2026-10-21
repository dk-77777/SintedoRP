import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";
import { previewState } from "../../scripts/preview-data";
async function open(page: Page) {
  await page.route("**/api/**", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(previewState("publico")),
    }),
  );
  await page.goto("/");
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
}
const translateY = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate(
      (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
    );
test("navegação pública funciona no tablet e celular com teclado", async ({
  page,
}) => {
  await open(page);
  for (const width of [768, 390]) {
    await page.setViewportSize({ width, height: 844 });
    const toggle = page.getByRole("button", {
      name: "Abrir menu",
      exact: true,
    });
    await expect(toggle).toBeVisible();
    await toggle.click();
    const navigation = page.getByRole("navigation", {
      name: "Navegação principal",
    });
    await expect(
      navigation.getByRole("link", { name: "Atendimento", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(toggle).toBeFocused();
    await expect(navigation).toBeHidden();
  }
  await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Atendimento", exact: true })
    .click();
  await expect(page).toHaveURL(/\/atendimento/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Entre para continuar",
  );
});
test("hero, scroll reverso, resize e navegação mantêm as cenas funcionais", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await open(page);
  await expect(page.locator(".editorial-home")).toHaveAttribute(
    "data-motion-ready",
    "true",
  );
  await expect
    .poll(() => translateY(page, ".hero-line > span"))
    .toBeLessThan(1);
  const initial = await translateY(page, ".portrait-parallax");
  await page.evaluate(() => scrollTo({ top: 600, behavior: "instant" }));
  await expect
    .poll(() => translateY(page, ".portrait-parallax"))
    .toBeGreaterThan(initial + 3);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect
    .poll(() => translateY(page, ".portrait-parallax"))
    .toBeLessThan(1);
  await page.locator("#care-title").scrollIntoViewIfNeeded();
  await expect
    .poll(() => translateY(page, "#care-title .text-reveal > span"))
    .toBeLessThan(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page
    .getByRole("link", { name: "Encontrar trabalho", exact: true })
    .click();
  await expect(page).toHaveURL(/\/vagas/);
  await page.goBack();
  await expect(page.locator(".editorial-home")).toHaveAttribute(
    "data-motion-ready",
    "true",
  );
  await expect
    .poll(() => translateY(page, ".hero-line > span"))
    .toBeLessThan(1);
  expect(errors).toEqual([]);
});
test("redução de movimento altera a preferência em execução e libera máscaras", async ({
  page,
}) => {
  await open(page);
  await expect(page.locator(".editorial-home")).toHaveAttribute(
    "data-motion-ready",
    "true",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      page
        .locator(".hero-line > span")
        .first()
        .evaluate((el) => getComputedStyle(el).transform),
    )
    .toBe("none");
  await expect
    .poll(() =>
      page
        .locator(".home-portrait")
        .evaluate((el) => getComputedStyle(el).clipPath),
    )
    .toBe("none");
  await page.evaluate(() => scrollTo({ top: 800, behavior: "instant" }));
  expect(await translateY(page, ".portrait-parallax")).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".editorial-home")).toHaveAttribute(
    "data-motion-ready",
    "true",
  );
});
test("home institucional continua legível quando JavaScript está desativado", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Quem cuida merece respeito.",
  );
  await expect(page.locator(".hero-actions .primary")).toBeVisible();
  await expect(page.locator("#care-title")).toBeVisible();
  await expect(page.locator(".hero-quick-search")).toHaveAttribute(
    "action",
    "/vagas",
  );
  await context.close();
});
test("busca e categoria encaminham filtros reais, sem alterar resultados", async ({
  page,
}) => {
  await open(page);
  await page.locator("#home-query").fill("diarista");
  await page.getByRole("button", { name: "Buscar vagas", exact: true }).click();
  await expect(page).toHaveURL(/q=diarista/);
  await page.goto("/");
  await page
    .locator(".care-categories")
    .getByRole("link", { name: "Babá", exact: true })
    .click();
  await expect(page).toHaveURL(/funcao=Bab/);
});

test("hero e cadastro passam na auditoria automática de acessibilidade", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  for (const path of ["/", "/cadastro"]) {
    await page.goto(path);
    await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
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
});
