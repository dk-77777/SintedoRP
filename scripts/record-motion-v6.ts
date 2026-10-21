import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { previewState } from "./preview-data";
const folder = "artifacts/cinematic-v6/recording";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium",
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await page.route("**/api/**", (r) =>
  r.fulfill({
    contentType: "application/json",
    body: JSON.stringify(previewState("publico")),
  }),
);
const cdp = await page.context().newCDPSession(page);
const frames: { file: string; time: number }[] = [];
const writes: Promise<void>[] = [];
cdp.on("Page.screencastFrame", (event) => {
  const file = `frame-${String(frames.length).padStart(5, "0")}.jpg`;
  frames.push({ file, time: event.metadata.timestamp ?? Date.now() / 1000 });
  writes.push(
    writeFile(`${folder}/${file}`, Buffer.from(event.data, "base64")),
  );
  void cdp.send("Page.screencastFrameAck", { sessionId: event.sessionId });
});
await cdp.send("Page.startScreencast", {
  format: "jpeg",
  quality: 85,
  maxWidth: 1440,
  maxHeight: 900,
  everyNthFrame: 1,
});
await page.goto(process.env.PREVIEW_ORIGIN || "http://localhost:3000");
await page.waitForTimeout(2300);
await page.mouse.move(950, 400);
await page.waitForTimeout(500);
await page.evaluate(
  "new Promise(resolve => {const start=performance.now();function tick(now){const t=Math.min(1,(now-start)/10500);window.scrollTo({top:t*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'});if(t<1)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)})",
);
await page.waitForTimeout(1300);
await page.evaluate(() => scrollTo({ top: 0, behavior: "smooth" }));
await page.waitForTimeout(1800);
await cdp.send("Page.stopScreencast");
await Promise.all(writes);
await browser.close();
const concat = frames
  .map(
    (f, i) =>
      `file '${f.file}'\nduration ${i < frames.length - 1 ? Math.max(0.016, frames[i + 1].time - f.time) : 0.5}\n`,
  )
  .join("");
await writeFile(folder + "/frames.txt", concat);
execFileSync("ffmpeg", [
  "-hide_banner",
  "-loglevel",
  "error",
  "-y",
  "-f",
  "concat",
  "-safe",
  "0",
  "-i",
  folder + "/frames.txt",
  "-vf",
  "fps=30,scale=1440:900",
  "-c:v",
  "libx264",
  "-crf",
  "24",
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
  "artifacts/cinematic-v6/conecta-motion.mp4",
]);
console.log("Gravação real do navegador concluída:", frames.length, "quadros.");
