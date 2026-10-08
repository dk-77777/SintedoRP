import { test, expect, type BrowserContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync, mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { Pool } from "pg";
import type { LiveState } from "../../src/live/types";
const origin = "http://localhost:3100";
const password = "Senha de teste forte 2026!";
const run = randomBytes(6).toString("hex");
let worker: BrowserContext,
  employer: BrowserContext,
  admin: BrowserContext,
  outsider: BrowserContext;
let db: Pool,
  workerId: string,
  employerId: string,
  jobId: string,
  applicationId: string,
  experienceId: string,
  reviewId: string;
const email = (role: string) => `${role}-${run}@example.test`;
async function mailboxLink(recipient: string, subject: string) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const list = await (
      await fetch("http://127.0.0.1:8025/api/v1/messages?limit=100")
    ).json();
    const item = list.messages?.find(
      (m: { To: { Address: string }[]; Subject: string }) =>
        m.To.some((t) => t.Address.toLowerCase() === recipient.toLowerCase()) &&
        m.Subject.includes(subject),
    );
    if (item) {
      const message = await (
        await fetch(`http://127.0.0.1:8025/api/v1/message/${item.ID}`)
      ).json();
      const match = message.Text?.match(/https?:\/\/[^\s]+/);
      if (match) return match[0] as string;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("E-mail esperado não chegou à caixa local.");
}
async function state(context: BrowserContext): Promise<LiveState> {
  const response = await context.request.get("/api/state");
  expect(response.status()).toBe(200);
  return response.json();
}
async function action(
  context: BrowserContext,
  input: Record<string, unknown>,
  expected = 200,
) {
  const response = await context.request.post("/api/actions", {
    data: input,
    headers: { Origin: origin },
  });
  expect(response.status(), `Ação ${input.action}`).toBe(expected);
  return response.json();
}
test.describe
  .serial("Plataforma funcional com PostgreSQL e sessões reais", () => {
  test.beforeAll(async ({ browser }) => {
    const fixture = JSON.parse(readFileSync(".local/e2e-env.json", "utf8"));
    if (
      !/^\/sintedorp_e2e_[a-f0-9]+$/.test(new URL(fixture.databaseURL).pathname)
    )
      throw new Error("Banco de teste inválido");
    db = new Pool({ connectionString: fixture.databaseURL });
    const create = async (role: string) => {
      const ctx = await browser.newContext({ baseURL: origin });
      const signup = await ctx.request.post("/api/auth/sign-up/email", {
        data: {
          name: `${role} de teste`,
          email: email(role),
          password,
          currentRole: "sindicato",
          suspended: false,
        },
        headers: { Origin: origin },
      });
      expect(signup.status()).toBe(200);
      if (role === "Trabalhador") {
        const denied = await ctx.request.post("/api/auth/sign-in/email", {
          data: { email: email(role), password },
          headers: { Origin: origin },
        });
        expect(denied.status()).toBe(403);
      }
      const link = await mailboxLink(email(role), "Confirme");
      await ctx.request.get(link);
      const login = await ctx.request.post("/api/auth/sign-in/email", {
        data: { email: email(role), password },
        headers: { Origin: origin },
      });
      expect(login.status()).toBe(200);
      expect((await state(ctx)).user?.role).toBe("trabalhador");
      return ctx;
    };
    worker = await create("Trabalhador");
    employer = await create("Empregador");
    admin = await create("Sindicato");
    outsider = await create("Terceiro");
    workerId = (await state(worker)).user!.id;
    execFileSync(
      "node",
      [
        "node_modules/tsx/dist/cli.mjs",
        "scripts/grant-admin.ts",
        email("Sindicato"),
        "ADMIN",
      ],
      {
        env: { ...process.env, DATABASE_URL: fixture.databaseURL },
        stdio: "pipe",
      },
    );
    await action(admin, { action: "role", role: "sindicato" });
    await action(worker, {
      action: "profile",
      kind: "trabalhador",
      document: "529.982.247-25",
      name: "Trabalhador de teste",
      region: "Ribeirão Preto — Centro",
      category: "Doméstica",
      availability: "Segunda a sexta",
      bio: "Experiência no cuidado da casa.",
      acceptedTerms: true,
    });
    await action(employer, {
      action: "profile",
      kind: "PJ",
      document: "12.ABC.345/01DE-35",
      name: "Empresa de teste",
      region: "Ribeirão Preto — Centro",
      category: "Outro",
      availability: "A combinar",
      bio: "",
      acceptedTerms: true,
    });
    employerId = (await state(employer)).employers[0].id;
  });
  test.afterAll(async () => {
    for (const ctx of [worker, employer, admin, outsider])
      if (ctx) await ctx.close();
    if (db) await db.end();
  });

  test("vaga moderada, revisão preservada, candidatura, mensagem, experiência, avaliação e relatório", async () => {
    const job = {
      action: "saveJob",
      employerId,
      title: "Doméstica — Centro",
      category: "Doméstica",
      region: "Ribeirão Preto — Centro",
      salaryCents: 240050,
      period: "Mês",
      schedule: "Segunda a sexta",
      hours: "8h às 17h, com intervalo",
      description: "Organização e cuidado da casa.",
      benefits: "Vale-transporte",
      acceptedTerms: true,
    };
    jobId = (await action(employer, job)).id;
    const anonymous = await worker.browser()!.newContext({ baseURL: origin });
    expect((await state(anonymous)).jobs.some((j) => j.id === jobId)).toBe(
      false,
    );
    await action(
      worker,
      {
        action: "moderateJob",
        id: jobId,
        version: 1,
        decision: "Publicada",
        reason: "Tentativa indevida",
      },
      403,
    );
    await action(admin, {
      action: "moderateJob",
      id: jobId,
      version: 1,
      decision: "Publicada",
      reason: "Condições claras para o ambiente de teste.",
    });
    const published = (await state(anonymous)).jobs.find(
      (j) => j.id === jobId,
    )!;
    expect(published.salary_cents).toBe(240050);
    applicationId = (
      await action(worker, {
        action: "apply",
        id: jobId,
        version: published.version,
      })
    ).id;
    await action(
      worker,
      { action: "apply", id: jobId, version: published.version },
      409,
    );
    const original = (await state(worker)).applications[0];
    await action(employer, {
      ...job,
      id: jobId,
      version: published.version,
      salaryCents: 250075,
    });
    expect((await state(anonymous)).jobs.some((j) => j.id === jobId)).toBe(
      false,
    );
    await action(
      admin,
      {
        action: "moderateJob",
        id: jobId,
        version: published.version,
        decision: "Publicada",
        reason: "Versão desatualizada",
      },
      409,
    );
    const edited = (await state(employer)).jobs.find((j) => j.id === jobId)!;
    await action(admin, {
      action: "moderateJob",
      id: jobId,
      version: edited.version,
      decision: "Publicada",
      reason: "Nova revisão analisada.",
    });
    const saved = (await state(worker)).applications[0];
    expect(saved.revision_id).toBe(original.revision_id);
    expect(saved.salary_cents).toBe(240050);
    await action(worker, {
      action: "message",
      id: applicationId,
      text: "Olá! Tenho interesse nesta oportunidade.",
    });
    expect((await state(employer)).messages[0].text).toContain(
      "Tenho interesse",
    );
    await action(
      outsider,
      { action: "message", id: applicationId, text: "Acesso indevido" },
      404,
    );
    expect((await state(outsider)).messages).toEqual([]);
    await action(employer, {
      action: "applicationStatus",
      id: applicationId,
      version: 1,
      status: "Em análise",
    });
    await action(employer, {
      action: "applicationStatus",
      id: applicationId,
      version: 2,
      status: "Contratação informada",
    });
    experienceId = (
      await action(employer, {
        action: "proposeHistory",
        id: applicationId,
        title: "Doméstica",
        start: "2026-09-01",
        end: "2026-09-30",
      })
    ).id;
    await action(
      worker,
      {
        action: "review",
        id: experienceId,
        rating: 5,
        text: "Experiência positiva.",
      },
      403,
    );
    await action(worker, {
      action: "confirmHistory",
      id: experienceId,
      confirm: true,
    });
    reviewId = (
      await action(worker, {
        action: "review",
        id: experienceId,
        rating: 5,
        text: "Condições respeitadas e boa comunicação.",
      })
    ).id;
    expect(
      (await state(anonymous)).reviews.some((r) => r.id === reviewId),
    ).toBe(false);
    await action(admin, {
      action: "moderateReview",
      id: reviewId,
      status: "Publicada",
      reason: "Conteúdo pertinente, sem dados pessoais.",
    });
    expect(
      (await state(anonymous)).reviews.some((r) => r.id === reviewId),
    ).toBe(true);
    await action(employer, {
      action: "respondReview",
      id: reviewId,
      text: "Agradecemos a colaboração.",
    });
    expect(
      (await state(anonymous)).reviews.some((r) => r.id === reviewId),
    ).toBe(false);
    await action(admin, {
      action: "moderateReview",
      id: reviewId,
      status: "Publicada",
      reason: "Resposta e avaliação analisadas.",
    });
    const report = await admin.request.get(
      "/api/reports?from=2026-10-01&to=2026-10-31",
    );
    expect(report.status()).toBe(200);
    const company = (await report.json()).items.find(
      (r: { employer_id: string }) => r.employer_id === employerId,
    );
    expect(company.published).toBe(2);
    expect(company.applications).toBe(1);
    expect(company.hires).toBe(1);
    expect(company.confirmed).toBe(1);
    expect(company.average).toBe(5);
    const old = await admin.request.get(
      "/api/reports?from=2026-09-01&to=2026-09-30",
    );
    expect((await old.json()).items[0].hires).toBe(0);
    const csv = await admin.request.get(
      "/api/reports?from=2026-10-01&to=2026-10-31&format=csv",
    );
    expect(csv.headers()["content-type"]).toContain("text/csv");
    expect(await csv.text()).toContain('"Empresa de teste"');
    const contested = (
      await action(employer, {
        action: "openCase",
        reviewId,
        title: "Revisar avaliação",
        detail: "Solicitamos mediação sobre o conteúdo.",
      })
    ).id;
    await action(
      employer,
      {
        action: "respondReview",
        id: reviewId,
        text: "Tentativa de contornar a contestação.",
      },
      409,
    );
    expect(
      (await state(anonymous)).reviews.some((r) => r.id === reviewId),
    ).toBe(false);
    await action(
      admin,
      {
        action: "moderateReview",
        id: reviewId,
        status: "Publicada",
        reason: "Tentativa durante contestação",
      },
      409,
    );
    await action(admin, {
      action: "resolveCase",
      id: contested,
      resolution:
        "Mediação concluída; avaliação mantida oculta até nova revisão.",
    });
    expect(
      (await state(employer)).cases.find((c) => c.id === contested)?.status,
    ).toBe("Resolvido");
    await anonymous.close();
  });

  test("autorização, privacidade, CSRF, conflitos e armazenamento", async () => {
    const publicContext = await worker
      .browser()!
      .newContext({ baseURL: origin });
    await action(
      publicContext,
      { action: "message", id: applicationId, text: "Sem sessão" },
      401,
    );
    const csrf = await worker.request.post("/api/actions", {
      headers: { Origin: "https://outra-origem.example" },
      data: { action: "message", id: applicationId, text: "Bloqueada" },
    });
    expect(csrf.status()).toBe(403);
    await action(worker, { action: "role", role: "sindicato" }, 403);
    await action(
      worker,
      {
        action: "profile",
        kind: "ADMIN",
        document: "52998224725",
        name: "Teste",
        region: "Centro",
        category: "Outro",
        availability: "Livre",
        bio: "",
        acceptedTerms: true,
      },
      400,
    );
    await action(
      worker,
      {
        action: "saveJob",
        employerId,
        title: "Outra vaga",
        category: "Doméstica",
        region: "Centro",
        salaryCents: 250000,
        period: "Mês",
        schedule: "Segunda a sexta",
        hours: "8h às 17h",
        description: "Teste",
        benefits: "",
        acceptedTerms: true,
      },
      403,
    );
    expect(
      (
        await outsider.request.get("/api/reports?from=2026-10-01&to=2026-10-31")
      ).status(),
    ).toBe(403);
    const publicState = await state(publicContext);
    const raw = JSON.stringify(publicState);
    expect(raw).not.toContain("52998224725");
    expect(raw).not.toContain("document_cipher");
    expect(raw).not.toContain(email("Trabalhador"));
    expect(publicState.applications).toEqual([]);
    expect(publicState.experiences).toEqual([]);
    const document = (
      await db.query(
        "SELECT document_hash,document_cipher FROM person WHERE user_id=$1",
        [workerId],
      )
    ).rows[0];
    expect(document.document_hash).not.toContain("52998224725");
    expect(document.document_cipher).toMatch(/^v1:/);
    const stored = (
      await db.query('SELECT password FROM account WHERE "userId"=$1', [
        workerId,
      ])
    ).rows[0].password;
    expect(stored).not.toBe(password);
    expect(stored.length).toBeGreaterThan(60);
    const invalidDates = await admin.request.get(
      "/api/reports?from=2026-02-30&to=2026-10-31",
    );
    expect(invalidDates.status()).toBe(400);
    const oversized = await worker.request.post("/api/actions", {
      headers: { Origin: origin },
      data: { action: "message", id: applicationId, text: "a".repeat(20000) },
    });
    expect(oversized.status()).toBe(413);
    await db.query("UPDATE employer SET name='=1+1' WHERE id=$1", [employerId]);
    const csv = await admin.request.get(
      "/api/reports?from=2026-10-01&to=2026-10-31&format=csv",
    );
    expect(await csv.text()).toContain('"\'=1+1"');
    await db.query("UPDATE employer SET name='Empresa de teste' WHERE id=$1", [
      employerId,
    ]);
    // Uma conta sindical que também seja empregadora não modera a própria revisão.
    const adminId = (await state(admin)).user!.id;
    await db.query(
      "INSERT INTO employer_member(employer_id,user_id) VALUES($1,$2)",
      [employerId, adminId],
    );
    const job = (await state(employer)).jobs.find((j) => j.id === jobId)!;
    await action(employer, {
      action: "saveJob",
      id: jobId,
      version: job.version,
      employerId,
      title: job.title,
      category: job.category,
      region: job.region,
      salaryCents: job.salary_cents,
      period: job.period,
      schedule: job.schedule,
      hours: job.hours,
      description: job.description,
      benefits: job.benefits,
      acceptedTerms: true,
    });
    await action(
      admin,
      {
        action: "moderateJob",
        id: jobId,
        version: job.version + 1,
        decision: "Publicada",
        reason: "Conflito de interesse",
      },
      403,
    );
    await db.query(
      "DELETE FROM employer_member WHERE employer_id=$1 AND user_id=$2",
      [employerId, adminId],
    );
    await action(admin, {
      action: "moderateJob",
      id: jobId,
      version: job.version + 1,
      decision: "Publicada",
      reason: "Revisão por pessoa sem vínculo com o empregador.",
    });
    await publicContext.close();
  });

  test("navegação responsiva, formulários, acessibilidade e persistência", async () => {
    mkdirSync("artifacts/live", { recursive: true });
    const publicContext = await worker
      .browser()!
      .newContext({ baseURL: origin });
    const publicPage = await publicContext.newPage();
    const workerPage = await worker.newPage();
    const employerPage = await employer.newPage();
    const adminPage = await admin.newPage();
    const errors: string[] = [];
    for (const page of [publicPage, workerPage, employerPage, adminPage])
      page.on("pageerror", (e) => errors.push(e.message));
    const routes: [typeof publicPage, string][] = [
      [publicPage, "/"],
      [publicPage, "/vagas"],
      [publicPage, `/vagas/${jobId}`],
      [publicPage, "/entrar"],
      [publicPage, "/cadastro"],
      [publicPage, "/recuperar-acesso"],
      [publicPage, "/privacidade"],
      [workerPage, "/trabalhador/candidaturas"],
      [workerPage, "/trabalhador/perfil"],
      [workerPage, `/mensagens/${applicationId}`],
      [workerPage, "/trabalhador/historico"],
      [workerPage, "/trabalhador/avaliacoes"],
      [workerPage, "/atendimento"],
      [employerPage, "/empregador/vagas"],
      [employerPage, "/empregador/vagas/nova"],
      [employerPage, "/empregador/candidatos"],
      [adminPage, "/sindicato/vagas"],
      [adminPage, "/sindicato/relatorios"],
      [adminPage, "/sindicato/cadastros"],
    ];
    for (const [page, path] of routes) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByText("Carregando oportunidades…")).toHaveCount(0);
      const audit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        audit.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
        path,
      ).toEqual([]);
      for (const width of [360, 768, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${path} ${width}`,
        ).toBe(true);
      }
    }
    await workerPage.goto(`/mensagens/${applicationId}`);
    await workerPage
      .getByLabel("Mensagem", { exact: true })
      .fill("Mensagem enviada pelo formulário real.");
    await workerPage
      .getByRole("button", { name: "Enviar mensagem", exact: true })
      .click();
    await expect(
      workerPage.getByText("Mensagem enviada pelo formulário real."),
    ).toBeVisible();
    await workerPage.reload();
    await expect(
      workerPage.getByText("Mensagem enviada pelo formulário real."),
    ).toBeVisible();
    await adminPage.goto("/sindicato/relatorios");
    await adminPage.getByRole("button", { name: "Gerar relatório" }).click();
    await expect(adminPage.getByRole("table")).toBeVisible();
    const audit = await new AxeBuilder({ page: adminPage })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
    for (const [name, page, path] of [
      ["inicio", publicPage, "/"],
      ["mensagens", workerPage, `/mensagens/${applicationId}`],
      ["relatorios", adminPage, "/sindicato/relatorios"],
    ] as const) {
      await page.goto(path);
      await expect(page.getByText("Carregando oportunidades…")).toHaveCount(0);
      for (const width of [360, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await page.screenshot({
          path: `artifacts/live/${name}-${width}.png`,
          fullPage: true,
        });
      }
    }
    await publicPage.goto("/demo");
    await expect(
      publicPage.getByText(
        "Protótipo · dados fictícios · use somente exemplos",
      ),
    ).toBeVisible();
    await publicPage
      .getByRole("link", { name: "Encontrar trabalho", exact: true })
      .first()
      .click();
    await expect(publicPage).toHaveURL(/\/demo\/vagas$/);
    expect(errors).toEqual([]);
    await publicContext.close();
  });

  test("encerramento preserva o período confirmado e exige acordo sobre a data final", async () => {
    const nextJobId = (
      await action(employer, {
        action: "saveJob",
        employerId,
        title: "Trabalho em andamento",
        category: "Doméstica",
        region: "Ribeirão Preto — Centro",
        salaryCents: 260000,
        period: "Mês",
        schedule: "Segunda a sexta",
        hours: "8h às 17h, com intervalo",
        description: "Condições do teste de encerramento.",
        benefits: "Vale-transporte",
        acceptedTerms: true,
      })
    ).id;
    await action(admin, {
      action: "moderateJob",
      id: nextJobId,
      version: 1,
      decision: "Publicada",
      reason: "Condições analisadas.",
    });
    const job = (await state(worker)).jobs.find((j) => j.id === nextJobId)!;
    const appId = (
      await action(worker, {
        action: "apply",
        id: nextJobId,
        version: job.version,
      })
    ).id;
    await action(employer, {
      action: "applicationStatus",
      id: appId,
      version: 1,
      status: "Em análise",
    });
    await action(employer, {
      action: "applicationStatus",
      id: appId,
      version: 2,
      status: "Contratação informada",
    });
    const ongoingId = (
      await action(employer, {
        action: "proposeHistory",
        id: appId,
        title: "Trabalho em andamento",
        start: "2026-09-01",
      })
    ).id;
    const getExperience = async () =>
      (await state(worker)).experiences.find((e) => e.id === ongoingId)!;
    await action(
      employer,
      {
        action: "closeExperience",
        id: ongoingId,
        version: 1,
        end: "2026-09-30",
      },
      409,
    );
    await action(worker, {
      action: "confirmHistory",
      id: ongoingId,
      confirm: true,
    });
    const initial = await getExperience();
    await action(
      worker,
      {
        action: "closeExperience",
        id: ongoingId,
        version: initial.version,
        end: "2026-08-31",
      },
      400,
    );
    await action(
      worker,
      {
        action: "closeExperience",
        id: ongoingId,
        version: initial.version,
        end: "2099-01-01",
      },
      400,
    );
    await action(
      outsider,
      {
        action: "closeExperience",
        id: ongoingId,
        version: initial.version,
        end: "2026-09-30",
      },
      404,
    );
    await action(
      worker,
      {
        action: "review",
        id: ongoingId,
        rating: 5,
        text: "Ainda em andamento.",
      },
      403,
    );

    const workerPage = await worker.newPage();
    await workerPage.goto("/trabalhador/historico");
    const form = workerPage.getByRole("form", {
      name: "Encerrar experiência: Trabalho em andamento",
    });
    await form.getByLabel("Data final do trabalho").fill("2026-09-30");
    await form.getByRole("button", { name: "Propor encerramento" }).click();
    await expect(
      workerPage.getByText("Aguardando resposta da outra parte."),
    ).toBeVisible();
    let pending = await getExperience();
    expect(pending.end_date).toBeNull();
    expect(pending.closure_status).toBe("Pendente");
    await action(
      worker,
      {
        action: "respondClosure",
        id: pending.closure_id,
        version: pending.version,
        confirm: true,
      },
      409,
    );
    await action(
      worker,
      {
        action: "closeExperience",
        id: ongoingId,
        version: pending.version,
        end: "2026-09-29",
      },
      409,
    );
    await action(
      outsider,
      {
        action: "respondClosure",
        id: pending.closure_id,
        version: pending.version,
        confirm: true,
      },
      404,
    );
    expect((await state(outsider)).experiences).toEqual([]);
    await action(
      worker,
      {
        action: "review",
        id: ongoingId,
        rating: 5,
        text: "Data ainda pendente.",
      },
      403,
    );
    const employerPage = await employer.newPage();
    await employerPage.goto("/empregador/historico");
    const audit = await new AxeBuilder({ page: employerPage })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
    await employerPage
      .getByRole("button", { name: "Recusar data final", exact: true })
      .click();
    const refusalDialog = employerPage.getByRole("dialog", {
      name: "A data proposta está incorreta?",
    });
    await expect(refusalDialog).toBeVisible();
    await refusalDialog
      .getByRole("button", { name: "Recusar data final", exact: true })
      .click();
    await expect(
      employerPage.getByText(/O período já confirmado foi preservado/),
    ).toBeVisible();
    const refused = await getExperience();
    expect(refused.end_date).toBeNull();
    expect(refused.contested).toBe(false);
    expect(refused.worker_confirmed && refused.employer_confirmed).toBe(true);
    expect(refused.confirmed_at).toBe(initial.confirmed_at);
    expect(
      (await state(employer)).cases.some(
        (c) => c.title === "Data final não reconhecida",
      ),
    ).toBe(true);
    await action(
      employer,
      {
        action: "respondClosure",
        id: pending.closure_id,
        version: refused.version,
        confirm: true,
      },
      409,
    );

    // Concurrent proposals cannot overwrite one another.
    const competing = await Promise.all(
      [worker, employer].map((ctx) =>
        ctx.request.post("/api/actions", {
          data: {
            action: "closeExperience",
            id: ongoingId,
            version: refused.version,
            end: "2026-09-29",
          },
          headers: { Origin: origin },
        }),
      ),
    );
    expect(competing.map((r) => r.status()).sort()).toEqual([200, 409]);
    pending = await getExperience();
    const responder = pending.closure_worker_confirmed ? employer : worker;
    await action(
      responder,
      {
        action: "respondClosure",
        id: pending.closure_id,
        version: refused.version,
        confirm: true,
      },
      409,
    );
    const responderPage = responder === worker ? workerPage : employerPage;
    await responderPage.reload();
    await responderPage
      .getByRole("button", { name: "Confirmar encerramento", exact: true })
      .click();
    const confirmationDialog = responderPage.getByRole("dialog", {
      name: "Confirmar a data final?",
    });
    await expect(confirmationDialog).toBeVisible();
    await confirmationDialog
      .getByRole("button", { name: "Confirmar encerramento", exact: true })
      .click();
    await expect(
      responderPage.getByText("Encerramento confirmado pelas duas partes.", {
        exact: true,
      }),
    ).toBeVisible();
    const ended = await getExperience();
    expect(ended.end_date).toBe("2026-09-29");
    expect(ended.closure_status).toBe("Confirmada");
    expect(ended.confirmed_at).toBe(initial.confirmed_at);
    await action(
      responder,
      {
        action: "respondClosure",
        id: pending.closure_id,
        version: ended.version,
        confirm: true,
      },
      409,
    );
    await action(
      worker,
      {
        action: "closeExperience",
        id: ongoingId,
        version: ended.version,
        end: "2026-09-30",
      },
      409,
    );
    await workerPage.reload();
    await expect(
      workerPage.getByText("Avaliar esta experiência", { exact: true }),
    ).toBeVisible();
    await action(worker, {
      action: "review",
      id: ongoingId,
      rating: 4,
      text: "Período encerrado por acordo.",
    });
    const proposals = await db.query(
      "SELECT status FROM experience_closure WHERE experience_id=$1 ORDER BY created_at",
      [ongoingId],
    );
    expect(proposals.rows.map((r) => r.status)).toEqual([
      "Recusada",
      "Confirmada",
    ]);

    const declaredId = (
      await action(worker, {
        action: "declareHistory",
        employerName: "Experiência anterior",
        title: "Diarista",
        start: "2026-08-01",
      })
    ).id;
    await action(
      outsider,
      {
        action: "closeExperience",
        id: declaredId,
        version: 1,
        end: "2026-08-30",
      },
      404,
    );
    await action(worker, {
      action: "closeExperience",
      id: declaredId,
      version: 1,
      end: "2026-08-30",
    });
    const declared = (await state(worker)).experiences.find(
      (e) => e.id === declaredId,
    )!;
    expect(declared.origin).toBe("Autodeclarado");
    expect(declared.employer_confirmed).toBe(false);
    expect(declared.end_date).toBe("2026-08-30");
    await action(
      worker,
      { action: "review", id: declaredId, rating: 5, text: "Sem confirmação." },
      403,
    );
    await workerPage.close();
    await employerPage.close();
  });

  test("recuperação de senha revoga sessões e impede reutilização do link", async () => {
    const before = await state(worker);
    expect(before.user).not.toBeNull();
    const response = await worker.request.post(
      "/api/auth/request-password-reset",
      {
        data: {
          email: email("Trabalhador"),
          redirectTo: `${origin}/redefinir-senha`,
        },
        headers: { Origin: origin },
      },
    );
    expect(response.status()).toBe(200);
    const link = await mailboxLink(email("Trabalhador"), "Redefina");
    const redirect = await worker.request.get(link, { maxRedirects: 0 });
    const url = new URL(redirect.headers().location, origin);
    const token = url.searchParams.get("token");
    expect(token).toBeTruthy();
    const newPassword = "Outra senha forte de teste 2026!";
    const reset = await worker.request.post("/api/auth/reset-password", {
      data: { token, newPassword },
      headers: { Origin: origin },
    });
    expect(reset.status()).toBe(200);
    expect((await state(worker)).user).toBeNull();
    const reuse = await worker.request.post("/api/auth/reset-password", {
      data: { token, newPassword: password },
      headers: { Origin: origin },
    });
    expect(reuse.status()).toBe(400);
    const oldLogin = await worker.request.post("/api/auth/sign-in/email", {
      data: { email: email("Trabalhador"), password },
      headers: { Origin: origin },
    });
    expect(oldLogin.status()).toBe(401);
    const newLogin = await worker.request.post("/api/auth/sign-in/email", {
      data: { email: email("Trabalhador"), password: newPassword },
      headers: { Origin: origin },
    });
    expect(newLogin.status()).toBe(200);
    expect((await state(worker)).user?.id).toBe(workerId);
    const nextRequest = await worker.request.post(
      "/api/auth/request-password-reset",
      {
        data: {
          email: email("Trabalhador"),
          redirectTo: `${origin}/redefinir-senha`,
        },
        headers: { Origin: origin },
      },
    );
    expect(nextRequest.status()).toBe(200);
    const expiringLink = await mailboxLink(email("Trabalhador"), "Redefina");
    const expiringRedirect = await worker.request.get(expiringLink, {
      maxRedirects: 0,
    });
    const expiredToken = new URL(
      expiringRedirect.headers().location,
      origin,
    ).searchParams.get("token");
    await db.query(
      "UPDATE verification SET \"expiresAt\"=now()-interval '1 hour' WHERE identifier=$1",
      [`reset-password:${expiredToken}`],
    );
    const expired = await worker.request.post("/api/auth/reset-password", {
      data: { token: expiredToken, newPassword: password },
      headers: { Origin: origin },
    });
    expect(expired.status()).toBe(400);
  });
  test("permissão de analista, suspensão e limite de tentativas", async () => {
    const id = (await state(outsider)).user!.id;
    await db.query(
      "INSERT INTO role_grant(user_id,role) VALUES($1,'ANALYST')",
      [id],
    );
    const page = await outsider.newPage();
    await page.goto("/sindicato");
    await expect(
      page.getByRole("link", { name: "Consultar relatórios" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Análise de vagas" }),
    ).toHaveCount(0);
    await page.close();
    expect(
      (
        await outsider.request.get("/api/reports?from=2026-10-01&to=2026-10-31")
      ).status(),
    ).toBe(200);
    await action(
      outsider,
      {
        action: "moderateJob",
        id: jobId,
        version: 1,
        decision: "Publicada",
        reason: "Analista sem permissão de moderação",
      },
      403,
    );
    await action(admin, {
      action: "suspendUser",
      id,
      suspended: true,
      reason: "Suspensão simulada para verificar revogação.",
    });
    expect((await state(outsider)).user).toBeNull();
    let limited = false;
    for (let i = 0; i < 10; i++) {
      const response = await worker.request.post("/api/auth/sign-in/email", {
        data: {
          email: email("Trabalhador"),
          password: "senha incorreta de teste",
        },
        headers: { Origin: origin, "x-forwarded-for": `192.0.2.${i + 1}` },
      });
      if (response.status() === 429) {
        limited = true;
        break;
      }
    }
    expect(limited).toBe(true);
  });
});
