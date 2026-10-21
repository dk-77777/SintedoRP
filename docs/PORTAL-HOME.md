# Página inicial do portal sindical

Atualização: 09/10/2026. Superfície: `/`. Modo: Operate.

A página inicial organiza o acesso aos serviços do Conecta SINTEDORP. A identidade existente permanece: Manrope local, superfícies claras e quentes, carvão, laranja queimado, fotografia editorial e animações GSAP.

## Estrutura

- Cabeçalho público: Início, Vagas, Como funciona, Sindicato e Atendimento; entrada e cadastro de conta.
- Hero cinematográfico original: foto em fundo amplo, título “Quem cuida merece respeito.”, busca de vagas e linhas animadas.
- Apoio sindical e região atendida na base do hero.
- Acessos diretos a oportunidades, atendimento, conta e guia da plataforma.
- Vagas publicadas com categoria, região, jornada e remuneração; atendimento sindical ao lado no desktop e abaixo no celular.
- Apresentação institucional breve e acessos para trabalhadores, empregadores e privacidade.
- Rodapé com serviços e informações existentes do projeto.

## Composição e movimento

A pedido do usuário, o hero cinematográfico anterior foi restaurado, mantendo o restante da estrutura de portal sindical. A foto ocupa o fundo com uma camada escura para leitura. O contêiner mantém altura definida, overflow oculto, recorte orientado para o rosto e espaço reservado antes do carregamento. O parallax move no máximo 12px no desktop e 5px no celular, dentro da margem de segurança da imagem. As linhas animadas voltam à composição ampla do hero.

O título ocupa três linhas, com tamanho fluido de 70 a 104px no desktop, 82px em larguras intermediárias, 60px no celular e 55px até 390px. Cabeçalhos das seções usam a mesma família tipográfica do portal. Os serviços começam imediatamente após o hero; a transição decorativa de 300px e o convite de conversão ao final permanecem removidos. As entradas de texto, a revelação de imagem e o movimento da identidade permanecem, com conteúdo visível por padrão e suporte a movimento reduzido.

O menu público recolhe até 950px, incluindo tablets. Escape fecha o menu e devolve o foco ao botão. O cabeçalho simplificado das telas de acesso permanece preservado.

## Validação

Com o servidor local aberto, execute `npm run test:visual`. Os testes usam respostas simuladas e dispensam uma preparação de banco. Para repetir as capturas e medições, execute `node scripts/verify-portal.mjs`. `PLAYWRIGHT_BASE_URL` permite apontar os dois comandos para outro endereço local.

- `npm run build`: compilação de produção e TypeScript aprovados.
- Seis testes Playwright: navegação pública em tablet e celular, scroll e retorno, resize, redução de movimento em execução, conteúdo sem JavaScript, busca e categorias, acessibilidade da home e cadastro.
- Capturas em 375, 390, 768, 1024, 1440 e 1878px: imagens carregadas, sem overflow horizontal ou erros de JavaScript.
- Auditoria Axe WCAG A/AA em desktop e celular: sem violações.

A validação visual usa os exemplos sintéticos existentes de `scripts/preview-data.ts`, interceptados no navegador, sem gravação no banco. Não foram criados notícias, parceiros, indicadores, depoimentos ou canais de contato institucionais.

Implementação: `src/live/home.tsx`, `src/styles/home.css`, `src/live/motion.ts`, `src/live/application.tsx`. As regras desta superfície têm precedência sobre a descrição antiga do hero em DESIGN.md; o restante do sistema e dos fluxos da aplicação não foi redesenhado nesta atualização.

## Refinamento dos serviços e oportunidades

Rodada restrita à faixa de atalhos, vagas em destaque e apoio sindical. Nessas áreas, os 22 ícones passaram a 2: identificação da conta e direção em “Ver todas”. Os destinos e textos dos 15 links foram preservados. Os títulos sublinhados, o foco visível e as áreas clicáveis mantêm a navegação reconhecível sem setas repetidas.

Os atalhos usam uma única borda de agrupamento. As vagas mantêm divisórias somente entre itens; título, remuneração e condições têm prioridade. O apoio sindical preserva sua ação principal, com links de conta e contato secundários. O estado de falha apresenta mensagem, orientação e “Tentar novamente”, que consulta a API existente sem recarregar a página. A ausência real de vagas conserva “Prepare seu perfil”; durante o carregamento não há ação prematura.

Comparação em 1440px e 390px: `.impeccable/review/home-services/{desktop,mobile}-{before,after}.png`. Os relatórios confirmam todos os textos e destinos dos links preservados, hero com medidas e conteúdo idênticos, sem overflow horizontal. Para repetir a captura atual, use `PORTAL_REVIEW_PHASE=after` ao executar `node scripts/review-home-services.mjs`; não sobrescreva a referência `before`.

Os 12 testes de `npm run test:visual` passaram: navegação dos atalhos, vagas e apoio por teclado em desktop e celular; quatro categorias, resultados e remoção de filtros; recuperação de falha; carregamento e ausência de vagas; testes anteriores de movimento, navegação e acessibilidade. Os dados são simulados no navegador e não alteram o banco. O detector sinalizou apenas diferenças consultivas com o DESIGN.md antigo; a revisão global desse documento ficou fora do escopo.

Possíveis próximas rodadas, não implementadas: revisar hierarquia dos blocos institucionais abaixo desta área; revisar detalhes e filtros da listagem de vagas; atualizar DESIGN.md para registrar a identidade já presente.

## Impeccable init

O usuário confirmou o contexto do produto e escolheu código primeiro para futuras superfícies novas. Preferência registrada em `.impeccable/config.json`; refinamentos por etapas registrados em PRODUCT.md. O live está configurado para `src/app/layout.tsx`. Com autorização explícita, `src/proxy.ts` permite o helper `http://localhost:8400` apenas em desenvolvimento; produção conserva a política estrita baseada em nonce. `node scripts/verify-live-policy.mjs` confirmou a permissão local e a política de produção idêntica à anterior, usando um servidor temporário encerrado ao fim da verificação. A configuração não inicia uma sessão de live automaticamente.
