import { test, expect, type Page } from "@playwright/test";
import { previewState } from "../../scripts/preview-data";
async function open(page: Page) {
  await page.route("**/api/state", (r) =>
    r.fulfill({ json: previewState("publico") }),
  );
  await page.goto("/");
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await page.evaluate(() => document.fonts.ready);
}

test("split responde a hover e foco sem deslocar as seções seguintes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  const paths = page.locator(".home-paths"),
    worker = page.locator(".home-path-worker"),
    employer = page.locator(".home-path-employer");
  const ratio = () =>
    worker.evaluate(
      (el) =>
        el.getBoundingClientRect().width /
        el.parentElement!.getBoundingClientRect().width,
    );
  const jobTop = () =>
    page
      .locator(".home-jobs")
      .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await paths.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const initial = await jobTop();
  await expect.poll(ratio).toBeCloseTo(0.5, 2);
  await worker.hover();
  await expect.poll(ratio).toBeCloseTo(0.55, 2);
  expect(Math.abs((await jobTop()) - initial)).toBeLessThan(1);
  await employer.hover();
  await expect.poll(ratio).toBeCloseTo(0.45, 2);
  expect(Math.abs((await jobTop()) - initial)).toBeLessThan(1);
  await page.mouse.move(0, 0);
  await worker.focus();
  await expect.poll(ratio).toBeCloseTo(0.55, 2);
  await page.keyboard.press("Tab");
  await expect(employer).toBeFocused();
  await expect.poll(ratio).toBeCloseTo(0.45, 2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await worker.focus();
  await expect.poll(ratio).toBeCloseTo(0.55, 2);
  expect(
    await paths.evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
});

test("etapas ficam legíveis e navegáveis durante scroll e redução de movimento", async ({
  page,
}) => {
  await open(page);
  await expect(page.locator(".editorial-home")).toHaveAttribute(
    "data-motion-ready",
    "true",
  );
  const first = page.locator(".home-steps > li").first();
  await first.scrollIntoViewIfNeeded();
  await expect(page.locator(".home-step-number")).toHaveText([
    "01",
    "02",
    "03",
  ]);
  expect(
    await page
      .locator(".home-steps a")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
  ).toEqual(["/cadastro", "/vagas", "/painel"]);
  const secondLink = page.locator(".home-steps > li").nth(1).getByRole("link");
  await secondLink.focus();
  await expect(secondLink).toBeFocused();
  await expect
    .poll(() =>
      secondLink.evaluate(
        (el) => getComputedStyle(el.closest("h3")!).fontWeight,
      ),
    )
    .toBe("600");
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await first.scrollIntoViewIfNeeded();
  await expect(first.getByRole("link")).toBeVisible();
  await expect(first).not.toHaveAttribute("data-step-active");
  expect(
    await first.evaluate((el) => el.style.getPropertyValue("--step-progress")),
  ).toBe("");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".editorial-home")).toHaveAttribute(
    "data-motion-ready",
    "true",
  );
});

test("header fica escuro no scroll sem deslocar conteúdo e os recursos usam destinos reais", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  const inner = page.locator(".header-inner");
  const header = page.locator(".site-header");
  const expectDarkHeader = async () => {
    const colors = await header.evaluate((el) => ({
      background: getComputedStyle(el, "::before").backgroundColor,
      foreground: getComputedStyle(el).color,
    }));
    const channels = (color: string) =>
      color
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number);
    expect(Math.max(...channels(colors.background))).toBeLessThan(40);
    expect(Math.min(...channels(colors.foreground))).toBeGreaterThan(200);
  };
  await expectDarkHeader();
  expect((await inner.boundingBox())!.height).toBe(88);
  const top = await page
    .locator(".home-manifesto")
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(() => scrollTo({ top: 180, behavior: "instant" }));
  await expect(page.locator(".site-header")).toHaveAttribute(
    "data-scrolled",
    "true",
  );
  expect((await inner.boundingBox())!.height).toBe(76);
  await expectDarkHeader();
  await page.locator(".home-guide").scrollIntoViewIfNeeded();
  await expectDarkHeader();
  await expect(page.locator(".header-actions .button")).toHaveCSS(
    "background-color",
    "rgb(244, 239, 231)",
  );
  expect(
    await page
      .locator(".home-manifesto")
      .evaluate((el) => el.getBoundingClientRect().top + scrollY),
  ).toBe(top);
  await expect(page.locator(".home-resources > a")).toHaveCount(4);
  expect(
    await page
      .locator(".home-resources > a")
      .evaluateAll((els) => els.map((el) => el.getAttribute("href"))),
  ).toEqual(["/painel", "/atendimento", "/privacidade", "/vagas"]);
  expect(
    (await page.locator(".site-footer").boundingBox())!.height,
  ).toBeLessThan(330);
});

test("no celular o split permanece vertical e a navegação funciona com header compacto", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  const worker = await page.locator(".home-path-worker").boundingBox(),
    employer = await page.locator(".home-path-employer").boundingBox();
  expect(worker!.width).toBe(390);
  expect(employer!.y).toBeGreaterThan(worker!.y);
  await page.evaluate(() => scrollTo({ top: 500, behavior: "instant" }));
  await expect(page.locator(".site-header")).toHaveAttribute(
    "data-scrolled",
    "true",
  );
  expect((await page.locator(".header-inner").boundingBox())!.height).toBe(68);
  const toggle = page.getByRole("button", { name: "Abrir menu", exact: true });
  await toggle.click();
  await expect(page.locator(".header-nav.open")).toHaveCSS(
    "background-color",
    "rgb(23, 21, 19)",
  );
  await expect(
    page
      .getByRole("navigation", { name: "Navegação principal" })
      .getByRole("link", { name: "Vagas", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("CTAs de texto e linhas do portal têm indicação de ação e foco visível", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  for (const selector of [
    ".home-guide-grid > div > .home-inline",
    ".home-union-details > a",
  ]) {
    for (const link of await page.locator(selector).all()) {
      await expect(link).toHaveCSS("text-decoration-line", "underline");
      expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await link.focus();
      await expect(link).toBeFocused();
      await expect(link).toHaveCSS("outline-style", "solid");
    }
  }
  const resource = page.locator('.home-resources > a[href="/privacidade"]');
  await expect(resource.locator("small")).toHaveText(
    "Entenda como seus dados são utilizados.",
  );
  await expect(resource.locator(".home-resource-action")).toHaveText("Acessar");
  expect((await resource.boundingBox())!.height).toBeGreaterThanOrEqual(104);
  await resource.focus();
  await expect(resource).toHaveCSS("outline-style", "solid");
  await expect(resource).toHaveCSS("background-color", "rgb(235, 224, 210)");
  // The description and padded edge belong to the same link target.
  await resource.click({ position: { x: 5, y: 5 } });
  await expect(page).toHaveURL(/\/privacidade/);
});

test("Home mantém tons quentes e concentra a fotografia e os ícones nas ações principais", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  const surfaces = [
    ".live-application",
    ".home-hero",
    ".home-path-worker",
    ".home-path-employer",
    ".home-union",
    ".home-closing",
    ".site-footer",
  ];
  const warm = async (selector: string) => {
    const rgb = await page.locator(selector).evaluate((el) =>
      getComputedStyle(el)
        .backgroundColor.match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number),
    );
    expect(rgb[0], selector).toBeGreaterThanOrEqual(rgb[1]);
    expect(rgb[1], selector).toBeGreaterThanOrEqual(rgb[2]);
  };
  for (const selector of surfaces) await warm(selector);
  await page.locator(".home-path-employer").hover();
  await warm(".home-path-employer");
  await page.locator(".home-closing .home-button").hover();
  await warm(".home-closing .home-button");
  await expect(page.locator("#care-title")).toHaveText(
    "O sindicato,perto de você.",
  );
  await expect(page.locator(".editorial-home img")).toHaveCount(1);
  await expect(page.locator(".home-portrait img")).toHaveAttribute(
    "src",
    /hero.webp/,
  );
  await expect(page.locator(".editorial-home a svg")).toHaveCount(2);
  await expect(page.locator(".hero-actions .primary svg")).toHaveCount(1);
  await expect(page.locator(".home-closing .home-button svg")).toHaveCount(1);
  await expect(
    page.locator(
      ".home-manifesto svg, .home-union svg, .home-paths svg, .home-guide svg",
    ),
  ).toHaveCount(0);
  await expect(page.locator(".home-path-employer")).toHaveAttribute(
    "href",
    "/cadastro?tipo=empregador",
  );
});
