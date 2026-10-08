import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync } from "node:fs";

async function enter(
  page: Page,
  role: "trabalhador" | "empregador" | "sindicato",
) {
  await page.goto("/entrar");
  await page
    .getByRole("button", { name: `Demonstrar ${role}`, exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp(`/${role}$`));
}

test("busca encaminha palavras-chave, compara remunerações da mesma periodicidade e limpa filtros", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("textbox", { name: "Função ou palavra-chave" })
    .fill("cuidador");
  await page.getByRole("button", { name: "Buscar vagas" }).click();
  await expect(
    page.getByRole("link", {
      name: "Cuidado e companhia no dia a dia",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Seu capricho faz a diferença",
      exact: true,
    }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Limpar", exact: true }).click();
  await page.getByLabel("Periodicidade da remuneração").selectOption("dia");
  await expect(
    page.getByRole("link", {
      name: "Seu capricho faz a diferença",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Remuneração mínima").fill("200");
  await expect(
    page.getByRole("heading", {
      name: "Ainda não encontramos essa combinação",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Limpar filtros", exact: true })
    .click();
  await expect(page.locator(".job-card")).toHaveCount(3);
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Buscar por palavra-chave" }),
  ).toHaveValue("");
  await page.goto("/vagas?q=cuidador");
  await expect(
    page.getByRole("textbox", { name: "Buscar por palavra-chave" }),
  ).toHaveValue("cuidador");
});

test("vaga fica pendente, sindicato publica, trabalhador se candidata uma vez e empregador recebe", async ({
  page,
}) => {
  await enter(page, "empregador");
  await page.getByRole("link", { name: "Nova vaga", exact: true }).click();
  await page
    .getByLabel("Título da oportunidade")
    .fill("Oportunidade de teste com condições claras");
  await page.getByLabel("Remuneração (R$)", { exact: true }).fill("2300");
  await page
    .getByLabel("Horários e intervalos")
    .fill("8h às 17h, intervalo de 1h");
  await page
    .getByLabel("Atividades e responsabilidades")
    .fill("Limpeza e organização dos ambientes em uma rotina combinada.");
  await page
    .getByLabel("Benefícios e outras condições")
    .fill("Vale-transporte e alimentação no local");
  await page.getByRole("button", { name: "Revisar oportunidade" }).click();
  await page.getByLabel("Li as regras de demonstração").check();
  await page.getByRole("button", { name: "Enviar para análise" }).click();
  let record = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Oportunidade de teste com condições claras",
      exact: true,
    }),
  });
  await expect(record.getByText("Pendente", { exact: true })).toBeVisible();
  await page.goto("/vagas");
  await expect(
    page.getByRole("link", {
      name: "Oportunidade de teste com condições claras",
      exact: true,
    }),
  ).toHaveCount(0);
  await enter(page, "sindicato");
  record = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Oportunidade de teste com condições claras",
      exact: true,
    }),
  });
  await record.getByRole("link", { name: "Analisar condições" }).click();
  await page.getByRole("button", { name: "Aprovar e publicar" }).click();
  await enter(page, "trabalhador");
  await page.goto("/vagas");
  await page
    .getByRole("link", {
      name: "Oportunidade de teste com condições claras",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Quero me candidatar" }).click();
  await expect(
    page.getByRole("button", { name: "Candidatura já enviada" }),
  ).toBeDisabled();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Candidatura já enviada" }),
  ).toBeDisabled();
  await page.goto("/trabalhador/candidaturas");
  record = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Oportunidade de teste com condições claras",
      exact: true,
    }),
  });
  await expect(record.getByText("Enviada", { exact: true })).toBeVisible();
  await enter(page, "empregador");
  record = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Oportunidade de teste com condições claras",
      exact: true,
    }),
  });
  await record.getByRole("link", { name: "Ver candidaturas" }).click();
  await expect(
    page.getByRole("heading", { name: "Marina Costa · exemplo", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Analisar candidatura" }).click();
  await expect(page.getByText("Em análise", { exact: true })).toBeVisible();
});

test("alteração de vaga publicada exige nova análise e preserva a revisão da candidatura", async ({
  page,
}) => {
  await enter(page, "trabalhador");
  await page.goto("/vagas/vaga-1");
  await page.getByRole("button", { name: "Quero me candidatar" }).click();
  await enter(page, "empregador");
  await page.goto("/empregador/vagas/vaga-1");
  await expect(
    page.getByText("Ao enviar alterações", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("Remuneração (R$)", { exact: true }).fill("2600");
  await page.getByRole("button", { name: "Revisar oportunidade" }).click();
  await page.getByLabel("Li as regras de demonstração").check();
  await page.getByRole("button", { name: "Enviar para análise" }).click();
  await page.goto("/vagas/vaga-1");
  await expect(
    page.getByRole("heading", { name: "Esta vaga não está disponível" }),
  ).toBeVisible();
  await enter(page, "trabalhador");
  await page.goto("/trabalhador/candidaturas");
  const record = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Um novo começo, em uma casa acolhedora",
      exact: true,
    }),
  });
  await expect(record.getByText(/versão 1 na candidatura/)).toBeVisible();
  await expect(record.getByText(/vaga está pendente/)).toBeVisible();
});

test("moderação exige motivo para ajustes e repassa orientação ao empregador", async ({
  page,
}) => {
  await enter(page, "sindicato");
  await page.goto("/sindicato/vagas/vaga-4");
  await page.getByRole("button", { name: "Solicitar ajustes" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Informe um motivo" }),
  ).toBeVisible();
  await page
    .getByLabel("Motivo ou orientação para o empregador")
    .fill("Detalhar os intervalos e as atividades combinadas.");
  await page.getByRole("button", { name: "Solicitar ajustes" }).click();
  await enter(page, "empregador");
  const record = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Atenção e carinho para os pequenos",
    }),
  });
  await expect(
    record.getByText("Ajustes solicitados", { exact: true }),
  ).toBeVisible();
  await expect(record.getByText(/Detalhar os intervalos/)).toBeVisible();
});

test("mensagem fictícia é mantida na conversa e pedido de apoio chega à fila demonstrativa", async ({
  page,
}) => {
  await enter(page, "trabalhador");
  await page.goto("/mensagens/cand-1");
  await page
    .getByRole("textbox", { name: "Mensagem de exemplo" })
    .fill("Tenho disponibilidade para conversar amanhã, no exemplo.");
  await page
    .getByRole("button", { name: "Enviar mensagem de exemplo" })
    .click();
  await expect(page.getByRole("log")).toContainText(
    "Tenho disponibilidade para conversar amanhã",
  );
  await page.reload();
  await expect(page.getByRole("log")).toContainText(
    "Tenho disponibilidade para conversar amanhã",
  );
  await page.getByRole("button", { name: "Pedir apoio" }).click();
  await enter(page, "sindicato");
  await page.goto("/sindicato/atendimentos");
  await expect(
    page.getByRole("heading", { name: "Denúncia de conversa · exemplo" }),
  ).toBeVisible();
});

test("avaliação só aparece para experiência confirmada e chega à moderação", async ({
  page,
}) => {
  await enter(page, "trabalhador");
  await page.goto("/trabalhador/historico");
  await expect(
    page.getByRole("button", { name: "Avaliar experiência", exact: true }),
  ).toHaveCount(1);
  await page
    .getByRole("button", { name: "Avaliar experiência", exact: true })
    .click();
  await page.getByLabel("Como foi a experiência?").selectOption("4");
  await page
    .getByLabel("Relato de exemplo")
    .fill("Condições claras e diálogo respeitoso neste exemplo fictício.");
  await page
    .getByRole("button", { name: "Enviar avaliação de exemplo" })
    .click();
  await expect(
    page.getByText("Avaliação restrita · enviada para análise simulada"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Avaliar experiência", exact: true }),
  ).toHaveCount(0);
  await enter(page, "sindicato");
  await page.goto("/sindicato/atendimentos");
  await expect(
    page.getByText(
      "Condições claras e diálogo respeitoso neste exemplo fictício.",
      { exact: true },
    ),
  ).toBeVisible();
});

test("cadastro PF/PJ revisa dados de exemplo sem coletar senha ou documento real", async ({
  page,
}) => {
  await page.goto("/cadastro");
  await page.getByLabel("Contratar", { exact: true }).check();
  await page.getByLabel("Tipo de empregador").selectOption("PJ");
  await expect(
    page.getByLabel("CNPJ de demonstração", { exact: true }),
  ).toHaveValue("CNPJ-DEMO");
  await expect(
    page.getByLabel("CNPJ de demonstração", { exact: true }),
  ).toHaveAttribute("readonly", "");
  await page
    .getByLabel("Nome da organização de exemplo")
    .fill("Organização de demonstração");
  await page.getByLabel("Entendo que este cadastro é fictício").check();
  await page.getByRole("button", { name: "Revisar cadastro" }).click();
  await expect(
    page.getByText("Pessoa jurídica", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Concluir cadastro fictício" })
    .click();
  await expect(page).toHaveURL(/\/empregador$/);
  await expect(page.locator("input[type=password]")).toHaveCount(0);
});

test("relatório calcula os dados da sessão, filtra empregador e gera CSV sem documentos", async ({
  page,
}) => {
  await enter(page, "sindicato");
  await page.goto("/sindicato/relatorios");
  await page
    .getByLabel("Empregador", { exact: true })
    .selectOption("Família Oliveira · exemplo");
  const row = page.getByRole("row").filter({
    has: page.getByRole("rowheader", { name: "Família Oliveira · exemplo" }),
  });
  await expect(row.getByRole("cell")).toHaveText(["2", "1", "1"]);
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV" }).click();
  const download = await downloaded;
  const stream = await download.createReadStream();
  let content = "";
  for await (const chunk of stream!) content += chunk.toString("utf8");
  expect(content).toContain('"Família Oliveira · exemplo";2;1;1');
  expect(content).not.toMatch(/CPF|CNPJ|telefone|email/i);
  await page.getByLabel("Início", { exact: true }).fill("2026-11-01");
  await expect(
    page.getByRole("alert").filter({ hasText: "data final" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Exportar CSV" }),
  ).toBeDisabled();
});

test("troca de perfis controla a navegação demonstrativa e reset restaura os exemplos", async ({
  page,
}) => {
  await page.goto("/sindicato");
  await expect(
    page.getByRole("heading", { name: "Escolha um perfil de demonstração" }),
  ).toBeVisible();
  await enter(page, "trabalhador");
  await page.goto("/sindicato");
  await expect(
    page.getByRole("heading", { name: "Escolha um perfil de demonstração" }),
  ).toBeVisible();
  await page.goto("/mensagens/cand-2");
  await expect(
    page.getByRole("heading", { name: "Conversa indisponível neste perfil" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reiniciar demonstração" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/trabalhador");
  await expect(
    page.getByRole("heading", { name: "Escolha um perfil de demonstração" }),
  ).toBeVisible();
});

test("páginas públicas e áreas dos perfis não têm violações automáticas WCAG A/AA", async ({
  page,
}) => {
  const issues: {
    path: string;
    rule: string;
    targets: string[][];
    details: (string | undefined)[];
  }[] = [];
  const targets: {
    role?: "trabalhador" | "empregador" | "sindicato";
    paths: string[];
  }[] = [
    {
      paths: [
        "/",
        "/vagas",
        "/vagas/vaga-1",
        "/entrar",
        "/cadastro",
        "/recuperar-acesso",
        "/como-funciona",
        "/privacidade",
        "/contato",
      ],
    },
    {
      role: "trabalhador",
      paths: [
        "/trabalhador",
        "/trabalhador/perfil",
        "/trabalhador/candidaturas",
        "/trabalhador/historico",
        "/mensagens/cand-1",
      ],
    },
    {
      role: "empregador",
      paths: [
        "/empregador",
        "/empregador/cadastro",
        "/empregador/vagas/nova",
        "/empregador/vagas/vaga-1/candidaturas",
      ],
    },
    {
      role: "sindicato",
      paths: [
        "/sindicato",
        "/sindicato/vagas/vaga-4",
        "/sindicato/empregadores",
        "/sindicato/atendimentos",
        "/sindicato/relatorios",
        "/sindicato/equipe",
      ],
    },
  ];
  for (const target of targets) {
    if (target.role) await enter(page, target.role);
    for (const path of target.paths) {
      await page.goto(path);
      await expect(page.locator("main h1")).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      for (const violation of results.violations)
        issues.push({
          path,
          rule: violation.id,
          targets: violation.nodes.map((n) => n.target as string[]),
          details: violation.nodes.map((n) => n.failureSummary),
        });
    }
  }
  expect(issues, "Auditoria automática de todas as rotas selecionadas").toEqual(
    [],
  );
});

for (const width of [360, 390, 768, 1280]) {
  test(`navegação e layout sem transbordamento em ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const groups = [
      {
        role: undefined,
        paths: [
          "/",
          "/vagas",
          "/vagas/vaga-1",
          "/entrar",
          "/cadastro",
          "/como-funciona",
          "/contato",
        ],
      },
      {
        role: "trabalhador" as const,
        paths: [
          "/trabalhador",
          "/trabalhador/perfil",
          "/trabalhador/candidaturas",
          "/trabalhador/historico",
          "/mensagens/cand-1",
        ],
      },
      {
        role: "empregador" as const,
        paths: [
          "/empregador",
          "/empregador/cadastro",
          "/empregador/vagas/nova",
          "/empregador/vagas/vaga-1",
          "/empregador/vagas/vaga-1/candidaturas",
        ],
      },
      {
        role: "sindicato" as const,
        paths: [
          "/sindicato",
          "/sindicato/vagas/vaga-4",
          "/sindicato/empregadores",
          "/sindicato/atendimentos",
          "/sindicato/relatorios",
          "/sindicato/equipe",
        ],
      },
    ];
    mkdirSync("artifacts", { recursive: true });
    for (const group of groups) {
      if (group.role) await enter(page, group.role);
      for (const path of group.paths) {
        await page.goto(path);
        await expect(page.locator("main h1")).toBeVisible();
        const sizes = await page.evaluate(() => ({
          page: document.documentElement.scrollWidth,
          viewport: window.innerWidth,
        }));
        expect(
          sizes.page,
          `Transbordamento em ${path} com ${width}px`,
        ).toBeLessThanOrEqual(sizes.viewport);
        if (
          ["/", "/vagas", "/sindicato", "/sindicato/relatorios"].includes(
            path,
          ) &&
          [360, 1280].includes(width)
        )
          await page.screenshot({
            path: `artifacts/${path === "/" ? "inicio" : path.slice(1).replaceAll("/", "-")}-${width}.png`,
            fullPage: true,
          });
      }
    }
    expect(errors).toEqual([]);
  });
}

test("atalho de teclado e menu móvel permitem alcançar navegação e conteúdo", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Pular para o conteúdo" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(
    page.getByRole("button", { name: "Fechar menu" }),
  ).toHaveAttribute("aria-expanded", "true");
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Encontrar trabalho" })
    .click();
  await expect(page).toHaveURL(/\/vagas$/);
  await expect(
    page.getByRole("button", { name: "Abrir menu" }),
  ).toHaveAttribute("aria-expanded", "false");
});
