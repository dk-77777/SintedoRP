import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { previewState } from "../../scripts/preview-data";
import { readFileSync } from "node:fs";

for (const [width, height] of [
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1440, 900],
  [1920, 1080],
]) {
  test(`home editorial acessível, sem overflow e com dados reais do provider em ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const fixture = previewState("publico");
    await page.route("**/api/state", (route) =>
      route.fulfill({ json: fixture }),
    );
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/");
    await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
    await expect(page.locator(".opportunity-row")).toHaveCount(3);
    const published = fixture.jobs
      .filter((job) => job.status === "Publicada")
      .slice(0, 3);
    for (const [index, job] of published.entries()) {
      await expect(page.locator(".opportunity-row").nth(index)).toContainText(
        job.title,
      );
      await expect(page.locator(".opportunity-row").nth(index)).toHaveAttribute(
        "href",
        `/vagas/${job.id}`,
      );
    }
    await expect(page.locator(".home-path-worker")).toHaveAttribute(
      "href",
      "/cadastro?tipo=trabalhador",
    );
    await expect(page.locator(".home-path-employer")).toHaveAttribute(
      "href",
      "/cadastro?tipo=empregador",
    );
    await expect(
      page
        .locator(".header-actions")
        .getByRole("link", { name: "Criar conta" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      audit.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("busca remove espaços e preserva acentos; sessão continua no header", async ({
  page,
}) => {
  await page.route("**/api/state", (route) =>
    route.fulfill({ json: previewState("trabalhador") }),
  );
  await page.goto("/");
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await expect(
    page.locator(".header-actions").getByRole("link", { name: "Minha área" }),
  ).toBeVisible();
  await expect(
    page.locator(".header-actions").getByRole("button", { name: "Sair" }),
  ).toBeVisible();
  await page.locator("#home-query").fill("  babá  ");
  await page.locator("#home-query").press("Enter");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("q"))
    .toBe("babá");
});

for (const width of [390, 1440]) {
  test(`estilos das rotas compartilhadas permanecem iguais ao CSS anterior em ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/api/state", (route) =>
      route.fulfill({ json: previewState("publico") }),
    );
    const oldStyles = readFileSync(
      "tests/fixtures/home-before-redesign.css",
      "utf8",
    );
    for (const path of [
      "/vagas",
      "/entrar",
      "/cadastro",
      "/como-funciona",
      "/privacidade",
      "/contato",
    ]) {
      await page.goto(path);
      await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
      await page.evaluate(() => document.fonts.ready);
      const sample = () =>
        page
          .locator(".site-header *, main *, .site-footer *")
          .evaluateAll((elements) =>
            elements.map((el) => {
              el.getBoundingClientRect();
              const s = getComputedStyle(el);
              const rect = el.getBoundingClientRect();
              return [
                s.display,
                s.color,
                s.backgroundColor,
                s.fontSize,
                s.lineHeight,
                s.padding,
                rect.x,
                rect.y,
                s.borderRadius,
                s.width,
                s.height,
              ];
            }),
          );
      const current = await sample();
      const previous = await page.addStyleTag({ content: oldStyles });
      expect(await sample(), `CSS compartilhado em ${path}`).toEqual(current);
      await previous.evaluate((el) => {
        el.parentNode?.removeChild(el);
      });
    }
  });
}
