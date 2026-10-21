# Handoff — Conecta SINTEDORP V6

## Projeto e estado
Next.js 16.4, React 19.3, TypeScript, PostgreSQL e Better Auth. Base recebida em SintedoRP-limpo.zip, isolada em `/workspace/work/conecta-v6`, com commit local da V3 antes das alterações. Redesign V6 implementado; conferência final aprovada e pacote de entrega preparado. O repositório antigo `/workspace/SintedoRP` foi preservado.

## Entregue
- Quatro estudos renderizáveis em `artifacts/creative-direction/studies.html` e PNGs.
- Hero integral com fotografia exclusiva, tipografia por máscaras, luz e grid.
- Conecta Flow em SVG com curvas, halo e desenho sincronizado.
- Transição escuro → marfim, scroll nativo/reversível, fotografia e luz em camadas.
- TextReveal (linha/horizontal), ImageReveal (cortina/scale), SectionTransition.
- Narrativa de cuidado, entradas coordenadas de vagas/etapas e CTA final.
- Quatro fotografias geradas, identificadas como ilustrativas e otimizadas em WebP.
- Login/cadastro com artes diferentes; fluxos existentes preservados.
- Sidebar, tokens quentes, estados ativos, skeleton e microinterações compartilhadas.
- Home institucional renderiza sem JS; dados atualizados de vagas exigem JS.
- Prévia HTML independente com 37 telas sintéticas; vídeo real de navegação.

## Arquivos alterados
`src/live/home.tsx`, `motion.ts`, `motion/components.tsx`, `motion/tokens.ts`, `public.tsx`, `application.tsx`; `src/styles/home.css`, `access.css`, `tokens.css`, `redesign.css`, `motion.css`; `src/app/layout.tsx`, `src/app/[[...route]]/page.tsx`; package/lock; exportador/verificador de prévia; scripts de captura/medição; testes de motion e teardown.
`src/styles/refinement-v3.css` removido; suas responsabilidades passaram às folhas das páginas/componentes. Nenhuma alteração em `src/server`, APIs ou migrações.

## Dependência
GSAP (versão exata no lockfile), com ScrollTrigger, importação dinâmica, `matchMedia().revert()` e limpeza de listeners. CSS para feedback simples; sem Three.js, Motion ou Lenis.

## Assets
`public/images/cinematic-v6/{hero,login,signup,care}.webp`. Cada um tem sidecar `.webp.json` com prompt, origem e uso. Manrope local/OFL preservada. Originais PNG na pasta de geração do ambiente; distribuição usa WebP. SVG original no componente ConectaFlow.

## Validação realizada
- 11 testes de servidor aprovados.
- 15 testes e2e do modo demonstrativo aprovados.
- 20 testes live aprovados, com PostgreSQL e SMTP locais, banco temporário, sessões reais, recuperação de senha e auditorias automáticas de acessibilidade.
- Motion: scroll reverso, resize, ida/volta entre rotas, alteração runtime de reduced-motion, busca/categoria e conteúdo sem JS.
- Matriz visual: 37 telas × 5 larguras (375, 390, 768, 1024, 1440) = 185 verificações; zero overflow ou exceções. Capturas anteriores: 74 verificações.
- Prévia offline: 37 telas em 360/768/1440, menus, diálogos, senha e navegação; zero requisições HTTP ou exceções.
- Laboratório local: seis navegações de produção com APIs sintéticas, LCP 304–784 ms, CLS 0. Event Timing 24–88 ms nos eventos registrados; não representa INP de campo. Sem throttling; ambiente compartilhado com outros testes.
- Build/typecheck finais e checagem dirigida após último ajuste visual: ver `VALIDATION.md`.

## Problemas corrigidos durante a execução
Teste de motion inicialmente selecionava três linhas com locator estrito; corrigido. Suspense impedia home sem JS; fronteira removida só da home. Teardown assumia banco `sintedorp`; usa agora o banco de manutenção `postgres`, mantendo guarda de limpeza exclusiva de testes locais. Exportador antigo só incorporava escultura; passou a incorporar fotos e fonte, e seu verificador foi atualizado. Lazy loading da imagem na prévia exigiu eager antes de decode na verificação.

## Limitações e pendências
Referências Banklio/Salazar/In Cognita/Tony Mak não vieram como imagens; sites externos não examinados. Direção baseada nas descrições do prompt e estudos próprios. Metas de Core Web Vitals/60 FPS de campo não certificadas. CSS legado geral não passou por reescrita integral; consolidação focou páginas afetadas e duplicações do workspace. Não houve publicação. Avaliação humana com usuários reais continua recomendada.

## Executar
Node 24. `npm ci`, configurar `.env.local` a partir do exemplo com o banco/SMTP local do usuário, depois `npm run dev`. Não substituir a configuração privada do usuário. Segredos e dados locais desta sessão não integram o ZIP.
`npm run typecheck`; `npm run build`; `npm run test:server`; `npm run test:e2e`; `npm run test:live` (exige PostgreSQL/SMTP locais).
Validação visual sem banco: `npx playwright test -c playwright.visual.config.ts` — APIs são interceptadas com fixtures sintéticas. Ajustar `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` ao navegador do ambiente quando necessário.

## Próxima ação exata
Abrir o ZIP entregue numa pasta separada, preservar a configuração `.env.local` do usuário, executar `npm ci` e `npm run dev`. Revisar home em 390/1440, especialmente a fita e a transição; comparar com `artifacts/cinematic-v6/final/`. Se forem fornecidas as imagens Banklio/Salazar, adicioná-las a `design-references/`, registrar a análise no REFERENCE_MANIFEST e só então refinar composição.

## Prompt de retomada
“Leia docs/ai-development/HANDOFF.md e VALIDATION.md. Continue a partir da V6 existente; preserve autenticação, dados e alterações locais. Confira git status. Não recrie o projeto nem publique automaticamente. Se houver novas referências visuais, compare-as aos estudos e implemente somente os refinamentos necessários, com testes proporcionais.”
