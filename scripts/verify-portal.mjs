import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { previewState } from "./preview-data.ts";
import { mkdir, writeFile } from "node:fs/promises";
const dir = ".impeccable/review";
await mkdir(dir, { recursive: true });
const browser = await chromium.launch(
  process.platform === "win32" ? { channel: "chrome" } : {},
);
const results = [];
for (const width of [375, 390, 768, 1024, 1440, 1878]) {
  const context = await browser.newContext({
    viewport: { width, height: 960 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/**", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(previewState("publico")),
    }),
  );
  await page.goto(process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000/");
  await page.waitForFunction(
    () => document.querySelector("main")?.getAttribute("aria-busy") === "false",
  );
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = "eager";
    await Promise.all(
      Array.from(document.images).map((image) => image.decode()),
    );
    await document.fonts.ready;
  });
  const measures = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    heading: document.querySelector("h1")?.textContent,
    image: Array.from(document.images).map((image) => ({
      src: image.getAttribute("src"),
      loaded: image.complete && image.naturalWidth > 0,
    })),
    hero: document
      .querySelector(".premium-hero")
      ?.getBoundingClientRect()
      .toJSON(),
    services: document
      .querySelector(".portal-services")
      ?.getBoundingClientRect()
      .toJSON(),
  }));
  const audit = [390, 1440].includes(width)
    ? (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      }))
    : [];
  await page.screenshot({
    path: `${dir}/${width === 1440 ? "desktop" : width === 390 ? "mobile" : `user-${width}`}.png`,
    fullPage: true,
  });
  results.push({ width, ...measures, errors, audit });
  await context.close();
}
await browser.close();
await writeFile(`${dir}/portal-checks.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
if (
  results.some(
    (r) =>
      r.overflow ||
      r.errors.length ||
      r.audit.length ||
      r.image.some((i) => !i.loaded),
  )
)
  process.exitCode = 1;
