import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { previewState, previewReports, previewViews } from "./preview-data";

const phase = process.argv[2] || "after";
const widths = phase === "before" ? [1440, 390] : [1440, 390, 375, 768, 1024];
const folder = `artifacts/${process.env.REDESIGN_CAPTURE_ROOT || "redesign"}/${phase}`;
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    "C:/Users/ohtas/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe",
  headless: true,
});
const results: unknown[] = [];
try {
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: 960 },
      locale: "pt-BR",
      reducedMotion: "reduce",
    });
    let role = "publico" as Parameters<typeof previewState>[0];
    await context.route("**/api/**", (route) => {
      const pathname = new URL(route.request().url()).pathname;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          pathname === "/api/state"
            ? previewState(role)
            : pathname === "/api/reports"
              ? { items: previewReports }
              : {},
        ),
      });
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const [index, view] of previewViews.entries()) {
      role = view.role;
      await page.goto("http://localhost:3000" + view.path);
      await page.waitForFunction(
        () =>
          document.querySelector("main#conteudo")?.getAttribute("aria-busy") ===
          "false",
      );
      if (view.profileKind)
        await page
          .getByLabel("Tipo de perfil", { exact: true })
          .selectOption(view.profileKind);
      if (view.path === "/sindicato/relatorios")
        await page
          .getByRole("button", { name: "Gerar relatório", exact: true })
          .click();
      await page.evaluate(async () => {
        for (const image of Array.from(document.images)) image.loading = "eager";
        await document.fonts.ready;
        await Promise.all(
          Array.from(document.images).map((i) => i.decode().catch(() => {})),
        );
      });
      const slug = `${String(index).padStart(2, "0")}-${view.role}-${view.path.replace(/[^a-z0-9]+/gi, "-")}`;
      if (width === 1440 || width === 390)
        await page.screenshot({
          path: `${folder}/${slug}-${width}.png`,
          fullPage: true,
        });
      results.push({
        width,
        path: view.path,
        role,
        heading: await page.locator("main h1").innerText(),
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        errors: [...errors],
      });
      errors.length = 0;
    }
    await context.close();
    console.log(
      `${phase}: ${width}px / ${previewViews.length} telas verificadas`,
    );
  }
} finally {
  await browser.close();
}
await writeFile(`${folder}/results.json`, JSON.stringify(results, null, 2));
console.log(
  JSON.stringify({
    screens: results.length,
    issues: results.filter((r: any) => r.overflow || r.errors.length),
  }),
);
