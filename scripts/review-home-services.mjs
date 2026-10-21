import { chromium } from "@playwright/test";
import { previewState } from "./preview-data.ts";
import { mkdir, writeFile } from "node:fs/promises";
const phase = process.env.PORTAL_REVIEW_PHASE || "before";
const dir = ".impeccable/review/home-services";
await mkdir(dir, { recursive: true });
const browser = await chromium.launch(
  process.platform === "win32" ? { channel: "chrome" } : {},
);
const evidence = [];
try {
  for (const [name, width] of [
    ["desktop", 1440],
    ["mobile", 390],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height: 4000 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.route("**/api/state", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(previewState("publico")),
      }),
    );
    await page.goto(
      process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000/",
    );
    await page.waitForFunction(
      () =>
        document.querySelector("main")?.getAttribute("aria-busy") === "false",
    );
    await page.evaluate(() => document.fonts.ready);
    const metrics = await page.evaluate(() => {
      const services = document
        .querySelector(".portal-services")
        .getBoundingClientRect();
      const content = document
        .querySelector(".portal-content")
        .getBoundingClientRect();
      const hero = document.querySelector(".premium-hero");
      return {
        clip: {
          x: 0,
          y: Math.floor(services.top),
          width: innerWidth,
          height: Math.ceil(content.bottom - Math.floor(services.top)),
        },
        links: Array.from(
          document.querySelectorAll(".portal-services a, .portal-content a"),
        ).map((a) => ({
          text: a.textContent.trim(),
          href: a.getAttribute("href"),
        })),
        icons: document.querySelectorAll(
          ".portal-services svg, .portal-content svg",
        ).length,
        overflow: document.documentElement.scrollWidth > innerWidth,
        hero: {
          text: hero.textContent,
          height: hero.getBoundingClientRect().height,
          headingSize: getComputedStyle(hero.querySelector("h1")).fontSize,
        },
      };
    });
    await page.screenshot({
      path: `${dir}/${name}-${phase}.png`,
      clip: metrics.clip,
    });
    evidence.push({ name, width, ...metrics });
    await context.close();
  }
  await writeFile(`${dir}/${phase}.json`, JSON.stringify(evidence, null, 2));
  console.log(
    evidence.map(({ name, icons, overflow }) => ({ name, icons, overflow })),
  );
} finally {
  await browser.close();
}
