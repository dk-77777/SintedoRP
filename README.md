# Conecta SINTEDORP

MVP funcional para conectar trabalhadores domésticos a empregadores PF/PJ, com análise de vagas e mediação sindical. Interface em português, responsiva, com PostgreSQL e sessões reais. A demonstração anterior continua disponível em `/demo`, separada dos dados do servidor.

O ambiente atual é de desenvolvimento: use dados de teste. Consulta cadastral externa, e-mail externo e publicação institucional ainda não estão configurados.

A [prévia visual independente](docs/PREVIA-VISUAL.md) permite inspecionar 37 telas atuais num único HTML, com dados fictícios e navegação entre perfis. O arquivo e o ZIP com imagens/instruções ficam em `artifacts/`; as operações reais continuam dependendo do servidor. O [redesign da interface](docs/REDESIGN-2026.md) reorganiza navegação, busca, painéis, acesso, histórico e relatórios para desktop e celular.

Paleta atual: [laranja queimado, marfim e carvão](docs/PALETA-LARANJA.md), com cores e contrastes documentados.

## Executar no ambiente em nuvem

Requisitos: Node.js 24, npm e Docker com daemon disponível. No checkout:

```sh
npm ci
npm run services
npm run db:migrate
npm run build
npm run start
```

`services` inicia PostgreSQL 17 e Mailpit com imagens verificadas por digest. Gera segredos aleatórios em arquivos privados somente quando ausentes; preserva configurações e dados existentes. O banco fica em `/workspace/.state/sintedorp/postgres`, fora do checkout. `.env.local` e `.local/` não devem ser compartilhados ou versionados. A caixa local captura e-mails de confirmação e recuperação, sem entrega externa.

Para editar, use `npm run dev`. A porta padrão é 3000. Se estiver ocupada por um serviço desconhecido, escolha outra e ajuste a origem de autenticação no mesmo processo:

```sh
BETTER_AUTH_URL=http://localhost:3001 npm run start -- --port 3001
```

Use exatamente a mesma origem no navegador e em `BETTER_AUTH_URL`. `/api/health` retorna `ready` somente quando o banco responde e as quatro migrações foram aplicadas.

## Primeiro acesso e equipe sindical

1. Crie uma conta em `/cadastro` e confirme o e-mail recebido no Mailpit local (porta 8025).
2. Entre em `/entrar` e complete o perfil como trabalhador, empregador PF ou PJ.
3. Para autorizar uma conta sindical existente e com e-mail confirmado, o operador executa:

```sh
npm run admin:grant -- pessoa@example.test ADMIN
```

As funções possíveis são `ADMIN`, `MODERATOR` e `ANALYST`. A concessão é registrada na auditoria; não há senha padrão nem endpoint público para promover contas. Administradores verificam cadastros e suspendem acessos; moderadores analisam vagas, avaliações e atendimentos; analistas consultam relatórios. Uma pessoa envolvida não pode moderar sua própria vaga ou avaliação nem resolver um atendimento relacionado.

## Fluxos funcionais

- Cadastros com CPF/CNPJ privado, conferência de dígitos no servidor e suporte a CNPJ alfanumérico. Documento cifrado com AES-256-GCM; unicidade por HMAC. Isso não é consulta à Receita Federal ou prova de identidade.
- Vagas com remuneração em centavos, jornada, benefícios, aceite e revisões imutáveis. A edição retira a vaga da busca até nova aprovação; candidaturas mantêm as condições da revisão original.
- Pesquisa pública com filtros e candidatura única por pessoa/vaga. Perfil profissional compartilhado somente com o empregador da candidatura; documento e e-mail não são compartilhados.
- Conversas persistidas e autorizadas no servidor, encaminhamento de candidaturas e canal interno de atendimento.
- Histórico autodeclarado separado de experiências da plataforma. Trabalho informado exige confirmação das duas partes; encerramento de trabalho em andamento exige acordo sobre a data final e preserva as propostas anteriores. Datas seguem o horário de São Paulo.
- Avaliação de experiência encerrada e confirmada, moderação antes de publicação, resposta do empregador e contestação que oculta o conteúdo até análise.
- Relatórios por empregador/período, com eventos em UTC e período interpretado no horário de São Paulo. CSV sem documentos/contatos e com proteção contra fórmulas.
- Confirmação de e-mail, recuperação com links temporários, revogação de sessões após alteração de senha, suspensão de conta, limites de requisições, verificação de origem, consultas parametrizadas e CSP com nonce.

Rotas principais: `/vagas`, `/trabalhador`, `/empregador`, `/sindicato`, `/mensagens` e `/atendimento`. O servidor valida cada ação; escolher um perfil na interface não concede permissão.

## Verificar

```sh
npm run typecheck
npm run build
npm run test:server
npm run test:live
npm run test:e2e
npm audit --omit=dev
```

Os testes funcionais criam e removem um banco temporário local, usam e-mails capturados pelo Mailpit e iniciam o servidor na porta 3100. Recusam banco remoto ou sem identificação de teste. A suíte do protótipo usa a porta 3200 e `APP_MODE=prototype` apenas nesse processo. Ambas exigem suas portas livres e detectam Chromium em `/usr/bin/chromium`; alternativamente, use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` ou instale Chromium pelo procedimento oficial do Playwright.

Resultados e limites estão em [docs/ETAPAS-04-A-07-RESULTADOS.md](docs/ETAPAS-04-A-07-RESULTADOS.md). Capturas ficam em `artifacts/live/`; relatórios locais em `playwright-report/`. Essas saídas são ignoradas pelo Git.

A revisão do encerramento e os resultados mais recentes estão em [docs/ETAPA-08-RESULTADOS.md](docs/ETAPA-08-RESULTADOS.md).

## Estrutura e migrações

- `src/live`: interface funcional e cliente de autenticação.
- `src/server`: autenticação, autorização, domínio, documentos, consultas e relatórios.
- `src/app/api`: operações privadas, estado autorizado, relatórios e prontidão.
- `migrations`: SQL versionado com aplicação transacional, checksum e trava de concorrência.
- `scripts`: serviços locais, migrações, provisionamento sindical e execução standalone.
- `src/demo` e `src/components`: demonstração com sessionStorage e componentes visuais.
- `tests/live`, `tests/server` e `tests/e2e`: integrações reais, documentos e protótipo.

A implementação usa o adaptador PostgreSQL oficial do Better Auth e consultas `pg`. Prisma foi retirado porque o download do mecanismo nativo estava bloqueado; nenhuma verificação de TLS/checksum foi desativada. A migração de autenticação foi gerada pela biblioteca e ficou versionada. Nunca altere uma migração aplicada; crie uma nova. Para alterações futuras do Better Auth, `scripts/auth-schema.ts` exige um novo arquivo de saída e não sobrescreve arquivos existentes.

## Publicação

O build gera `.next/standalone`; `npm run start` copia os arquivos estáticos e executa esse pacote. O Dockerfile prepara a mesma aplicação sem incluir `.env.local` ou segredos do desenvolvimento. A configuração do ambiente em nuvem é salva separadamente como rascunho; sua publicação pelo produto não equivale à publicação institucional do site.

Configuração e pendências externas: [docs/PUBLICACAO.md](docs/PUBLICACAO.md). O projeto pode ser desenvolvido e testado sem contratar uma API de CPF/CNPJ. A consulta externa só deve ser ativada após escolha do provedor, contrato e definição da finalidade/base legal.

Para apresentação acadêmica com planos gratuitos, o caminho recomendado é [Vercel + Supabase](docs/HOSPEDAGEM-GRATUITA.md). A condição de uso pessoal/não comercial do Vercel Hobby precisa ser considerada antes de uma adoção institucional. `DATABASE_POOL_MAX` permite limitar entre 1 e 12 conexões por instância; o padrão local é 12.

O passo a passo para abrir os projetos, cadastrar variáveis e executar migrações está em [docs/CRIAR-CONTAS-E-PUBLICAR.md](docs/CRIAR-CONTAS-E-PUBLICAR.md). `npm run deploy:prepare` prepara modelos privados sem sobrescrever arquivos; `npm run deploy:check` valida variáveis explicitamente injetadas sem imprimir valores. A opção `--connect` verifica banco/checksums e autenticação SMTP sem enviar mensagens ou publicar o site. Resultados em [docs/ETAPA-09-RESULTADOS.md](docs/ETAPA-09-RESULTADOS.md).
