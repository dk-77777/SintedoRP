import { chromium, expect } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { previewState, previewReports, previewViews } from "./preview-data";

const origin = process.env.PREVIEW_ORIGIN ?? "http://localhost:3305";
if (!["localhost", "127.0.0.1"].includes(new URL(origin).hostname))
  throw new Error("A captura exige o servidor local e dados fictícios.");
const dir = resolve("artifacts/previa-visual");
await mkdir(dir, { recursive: true });
const sculptureAsset = `data:image/webp;base64,${(await readFile("public/images/cuidado-escultura.webp")).toString("base64")}`;
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? "/usr/bin/chromium",
  headless: true,
});
const views: ((typeof previewViews)[number] & { html: string })[] = [];
const errors: string[] = [];
try {
  for (const role of [
    "publico",
    "trabalhador",
    "empregador",
    "sindicato",
  ] as const) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 960 },
      locale: "pt-BR",
      timezoneId: "America/Sao_Paulo",
    });
    // All API reads are synthetic; no session or record from the database is exported.
    await context.route("**/api/**", (route) => {
      const path = new URL(route.request().url()).pathname;
      const body =
        path === "/api/state"
          ? previewState(role)
          : path === "/api/reports"
            ? { items: previewReports }
            : { error: "Prévia visual: operação real indisponível." };
      return route.fulfill({
        status: ["/api/state", "/api/reports"].includes(path) ? 200 : 403,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    for (const view of previewViews.filter((v) => v.role === role)) {
      await page.goto(origin + view.path);
      await expect(page.locator("main#conteudo")).toHaveAttribute(
        "aria-busy",
        "false",
      );
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      if (view.profileKind) {
        await page
          .getByLabel("Tipo de perfil", { exact: true })
          .selectOption(view.profileKind);
        await expect(
          page.getByLabel(view.profileKind === "PJ" ? "CNPJ" : "CPF", {
            exact: true,
          }),
        ).toBeVisible();
      }
      if (view.path === "/sindicato/relatorios") {
        await page
          .getByRole("button", { name: "Gerar relatório", exact: true })
          .click();
        await expect(page.getByRole("table")).toBeVisible();
      }
      await page
        .locator(".home-sculpture-image")
        .evaluateAll(async (images) => {
          await Promise.all(
            images.map((image) => (image as HTMLImageElement).decode()),
          );
          await Promise.all(
            document
              .getAnimations()
              .filter(
                (animation) =>
                  animation.effect?.getComputedTiming().iterations !== Infinity,
              )
              .map((animation) => animation.finished.catch(() => undefined)),
          );
        });
      const html = await page.evaluate((sculptureAsset) => {
        const body = document.body.cloneNode(true) as HTMLElement;
        body
          .querySelectorAll("script,link,meta,iframe")
          .forEach((node) => node.remove());
        body
          .querySelectorAll("[nonce]")
          .forEach((node) => node.removeAttribute("nonce"));
        body.querySelectorAll("img.home-sculpture-image").forEach((image) => {
          image.setAttribute("src", sculptureAsset);
          image.removeAttribute("srcset");
          image.removeAttribute("sizes");
        });
        // Preserve form values currently visible in React-controlled inputs.
        for (const [index, field] of [
          ...body.querySelectorAll("input,select,textarea"),
        ].entries()) {
          const original = document.querySelectorAll("input,select,textarea")[
            index
          ] as HTMLInputElement;
          if (field instanceof HTMLInputElement) {
            field.setAttribute("value", original.value);
            if (original.checked) field.setAttribute("checked", "");
          } else if (field instanceof HTMLTextAreaElement)
            field.textContent = original.value;
          else if (field instanceof HTMLSelectElement)
            for (const option of field.options)
              option.toggleAttribute(
                "selected",
                option.value === original.value,
              );
        }
        return body.innerHTML;
      }, sculptureAsset);
      views.push({ ...view, html });
      const captureNames: Record<string, string> = {
        "/": "inicio",
        "/entrar": "acesso",
        "/vagas": "vagas",
        "/trabalhador": "painel",
        "/trabalhador/historico": "historico",
        "/sindicato/relatorios": "relatorios",
        "/empregador/vagas/nova": "nova-vaga",
      };
      if (captureNames[view.path]) {
        const name = captureNames[view.path];
        for (const width of [1440, 390]) {
          await page.setViewportSize({ width, height: 960 });
          await page.screenshot({
            path: resolve(dir, `${name}-${width}.png`),
            fullPage: true,
            animations: "disabled",
          });
        }
        await page.setViewportSize({ width: 1440, height: 960 });
      }
      console.log(`Capturada: ${role} — ${view.label}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
if (errors.length) throw new Error(`Exceções na captura: ${errors.join("; ")}`);

const tokens = await readFile("src/styles/tokens.css", "utf8");
const css = (await readFile("src/styles/globals.css", "utf8")).replace(
  /^@import[^;]+;/m,
  "",
);
const redesign =
  (await readFile("src/styles/redesign.css", "utf8")) +
  "\n" +
  (await readFile("src/styles/home.css", "utf8"));
const data = JSON.stringify(views).replace(/</g, "\\u003c");
const viewerCSS = `
.preview-bar{background:var(--panel);color:#fff;padding:16px 24px;font:14px/1.45 system-ui,sans-serif;border-bottom:3px solid var(--highlight)}
.preview-bar .preview-inner{max-width:1392px;margin:auto;display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.preview-bar strong{font-size:16px}.preview-bar label{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.preview-bar select{background:#fff;color:var(--brand);padding:8px 12px;border-radius:8px;max-width:100%;min-height:40px;border:1px solid var(--control-line)}.preview-bar p{margin:8px auto 0;max-width:1392px;color:var(--panel-text)}.preview-help{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:1000;background:var(--panel);color:white;padding:14px 22px;border-radius:12px;box-shadow:0 8px 30px #0002;max-width:calc(100% - 32px);width:max-content;font:14px/1.5 system-ui}.preview-help[hidden]{display:none}@media(max-width:600px){.preview-bar{padding:12px 16px}.preview-bar label{width:100%}.preview-bar select{flex:1;min-width:0}.preview-bar .preview-inner{gap:10px}}
`;
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"><title>Conecta SINTEDORP — Prévia visual</title><style>${tokens}\n${css}\n${redesign}\n${viewerCSS}</style></head><body>
<div class="preview-bar"><div class="preview-inner"><strong>Conecta SINTEDORP · Prévia visual</strong><label>Visualizar perfil <select id="preview-role"><option value="publico">Visitante</option><option value="trabalhador">Trabalhador</option><option value="empregador">Empregador</option><option value="sindicato">Sindicato</option></select></label><label>Visualizar tela <select id="preview-view"></select></label></div><p>Telas atuais · 7 de outubro de 2026 · dados e valores fictícios. Navegue pelos menus; os formulários não fazem cadastros ou operações reais.</p></div>
<div id="preview-app"></div><div id="preview-help" class="preview-help" role="status" hidden></div><script id="preview-data" type="application/json">${data}</script>
<script>
const views=JSON.parse(document.getElementById('preview-data').textContent);
const names={publico:'Visitante',trabalhador:'Trabalhador',empregador:'Empregador',sindicato:'Sindicato'};
const roleSelect=document.getElementById('preview-role'), viewSelect=document.getElementById('preview-view'), app=document.getElementById('preview-app'), help=document.getElementById('preview-help');
let current=views[0], timer;
const key=v=>v.role+'|'+v.path;
function notify(text){help.textContent=text;help.hidden=false;clearTimeout(timer);timer=setTimeout(()=>help.hidden=true,5000);}
function render(){let token='';try{token=decodeURIComponent(location.hash.slice(1));}catch{}help.hidden=true;clearTimeout(timer);current=views.find(v=>key(v)===token)||views[0];roleSelect.value=current.role;viewSelect.replaceChildren();for(const v of views.filter(v=>v.role===current.role)){const o=document.createElement('option');o.value=key(v);o.textContent=v.label;viewSelect.append(o);}viewSelect.value=key(current);app.innerHTML=current.html;document.title=current.label+' · Conecta SINTEDORP';app.querySelectorAll('a').forEach(a=>{a.dataset.previewHref=a.getAttribute('href');a.setAttribute('href','#');});app.querySelector('main h1')?.focus({preventScroll:true});window.scrollTo(0,0);}
function go(view){const hash=encodeURIComponent(key(view));if(location.hash.slice(1)===hash)render();else location.hash=hash;}
roleSelect.addEventListener('change',()=>go(views.find(v=>v.role===roleSelect.value)));
viewSelect.addEventListener('change',()=>go(views.find(v=>key(v)===viewSelect.value)));
app.addEventListener('click',event=>{const a=event.target.closest('a');if(a){event.preventDefault();const href=a.dataset.previewHref;if(href?.startsWith('#')){app.querySelector(href)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return;}let path=href?.split('?')[0];if(path==='/painel')path=current.role==='publico'?'/':('/'+current.role);if(path?.startsWith('/mensagens/')&&!views.some(v=>v.role===current.role&&v.path===path))path='/mensagens';const target=views.find(v=>v.role===current.role&&v.path.split('?')[0]===path)||views.find(v=>v.path.split('?')[0]===path);if(target)go(target);else notify('Esta ação depende do site online. Explore as telas pela barra superior.');return;}const button=event.target.closest('button');if(!button)return;if(button.classList.contains('menu-toggle')){const nav=app.querySelector('.header-nav');const open=nav.classList.toggle('open');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');return;}if(button.id==='workspace-menu-toggle'){const nav=app.querySelector('#workspace-navigation');const open=nav.classList.toggle('is-open');button.setAttribute('aria-expanded',String(open));button.innerHTML=(open?'Fechar':'Menu');return;}if(button.id==='filters-toggle'){const panel=app.querySelector('#job-filters');const open=panel.classList.toggle('is-open');button.setAttribute('aria-expanded',String(open));button.textContent=open?'Fechar filtros':'Filtros';return;}if(button.classList.contains('filters-apply')){app.querySelector('#job-filters').classList.remove('is-open');const toggle=app.querySelector('#filters-toggle');toggle.setAttribute('aria-expanded','false');toggle.textContent='Filtros';toggle.focus();return;}if(button.classList.contains('password-toggle')){const input=button.closest('.password-field').querySelector('input');const show=input.type==='password';input.type=show?'text':'password';button.textContent=show?'Ocultar':'Mostrar';button.setAttribute('aria-label',show?'Ocultar senha':'Mostrar senha');button.setAttribute('aria-pressed',String(show));return;}if(button.dataset.confirmationTarget){document.getElementById(button.dataset.confirmationTarget)?.showModal();return;}if(button.dataset.dialogClose){button.closest('dialog')?.close();return;}if(button.closest('dialog'))button.closest('dialog').close();if(button.textContent.trim()==='Sair'){go(views[0]);return;}event.preventDefault();notify('Esta é uma prévia visual. A operação real será feita no site com servidor, banco e acesso verificado.');});
app.addEventListener('submit',event=>{event.preventDefault();notify('Prévia visual: nenhum dado foi enviado ou cadastrado.');});
document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;const toggle=app.querySelector('#workspace-menu-toggle');if(toggle?.getAttribute('aria-expanded')==='true'){app.querySelector('#workspace-navigation')?.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu';toggle.focus();}const filters=app.querySelector('#filters-toggle');if(filters?.getAttribute('aria-expanded')==='true'){app.querySelector('#job-filters')?.classList.remove('is-open');filters.setAttribute('aria-expanded','false');filters.textContent='Filtros';filters.focus();}});function updateScene(){const node=app.querySelector('.home-scene');if(!node)return;const enabled=matchMedia('(prefers-reduced-motion: no-preference) and (min-width: 900px)').matches;node.style.setProperty('--sculpture-offset',(enabled?Math.max(-70,Math.min(70,-node.getBoundingClientRect().top*.14)):0)+'px');}let sceneFrame=0;function scheduleScene(){if(!sceneFrame)sceneFrame=requestAnimationFrame(()=>{sceneFrame=0;updateScene();});}window.addEventListener('scroll',scheduleScene,{passive:true});window.addEventListener('resize',scheduleScene);matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',scheduleScene);window.addEventListener('hashchange',()=>{render();scheduleScene();});render();scheduleScene();
</script></body></html>`;
const output = resolve(dir, "Conecta-SINTEDORP-previa.html");
await writeFile(output, html, "utf8");
await writeFile(
  resolve(dir, "LEIA-ME.txt"),
  `Conecta SINTEDORP — Prévia visual\n\nAbra Conecta-SINTEDORP-previa.html no Chrome, Edge ou Firefox. Não precisa instalar Node.js, iniciar servidor ou conectar à internet.\n\nUse Visualizar perfil e Visualizar tela na barra superior. Os menus também navegam entre as telas. São ${views.length} telas da interface atual, capturadas com dados fictícios. Formulários, filtros, moderação, envio de mensagens e exportação CSV não executam operações neste arquivo; detalhes expansíveis, menus, mostrar/ocultar senha e diálogos de confirmação funcionam para inspeção.\n\nNenhuma conta, documento, senha, token ou registro real foi exportado. O HTML é uma apresentação visual, não a aplicação completa com banco e autenticação.\n\nVersão: 7 de outubro de 2026.\n`,
  "utf8",
);
console.log(
  `Gerado arquivo HTML independente com ${views.length} telas; sem exceções JavaScript na captura.`,
);
