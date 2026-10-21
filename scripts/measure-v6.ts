import { chromium } from "@playwright/test";
import { writeFile, mkdir } from "node:fs/promises";
import { previewState } from "./preview-data";
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium",
});
const results: unknown[] = [];
for (const width of [390, 1440])
  for (let run = 1; run <= 3; run++) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();
    await page.route("**/api/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: JSON.stringify(previewState("publico")),
      }),
    );
    await page.addInitScript(
      `window.__metrics={lcp:0,cls:0,longTasks:0,interactionDurations:[]};new PerformanceObserver(list=>{for(const e of list.getEntries())window.__metrics.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__metrics.cls+=e.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(list=>{window.__metrics.longTasks+=list.getEntries().length}).observe({type:'longtask',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(e.interactionId)window.__metrics.interactionDurations.push(e.duration)}).observe({type:'event',durationThreshold:16,buffered:true});`,
    );
    await page.goto(process.env.PREVIEW_ORIGIN || "http://localhost:3305");
    await page.waitForTimeout(2200);
    await page.locator("#home-query").click();
    await page.locator("#home-query").fill("diarista");
    await page.waitForTimeout(200);
    const metrics = (await page.evaluate("window.__metrics")) as {
      lcp: number;
      cls: number;
      longTasks: number;
      interactionDurations: number[];
    };
    results.push({ width, run, ...metrics });
    await context.close();
  }
await browser.close();
await mkdir("artifacts/cinematic-v6", { recursive: true });
await writeFile(
  "artifacts/cinematic-v6/performance-lab.json",
  JSON.stringify(
    {
      environment:
        "Chromium local, build de produção, APIs sintéticas, sem throttling; seis navegações novas. Não representa Core Web Vitals de campo. Event Timing listado não é INP de campo.",
      results,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify(results));
