# Redesign SINTEDORP — entrega
Atualizado em 8 de outubro de 2026.

## Resultado
Implementação local disponível em http://localhost:3000. Saúde da API confirmada como ready após os testes. Docker/PostgreSQL e Mailpit funcionam; o impedimento inicial de carregamento foi resolvido após a instalação do WSL e inicialização dos serviços.

Home editorial com título, busca funcional, fotografia P&B e apoio sindical; acesso dividido entre formulário e imagem; sistema compartilhado aplicado a vagas, perfil, painéis, mensagens, histórico, avaliações, atendimento e administração sindical. Rotas e regras de negócio preservadas. O modo de demonstração mantém seus fluxos simulados e recebe os tokens globais; a revisão detalhada cobre as 37 telas da plataforma conectada.

## Arquitetura e alterações
- src/app/layout.tsx: Manrope variável local e folha de acesso.
- src/live/home.tsx: composição editorial, busca, categorias, vagas do sistema e narrativa.
- src/live/public.tsx: login, cadastro, recuperação e redefinição com a mesma estrutura; rótulo específico para reenvio de confirmação e erro de login explícito.
- src/live/application.tsx: navegação, estado ativo, acesso e cabeçalho.
- src/live/motion.ts: revelação com IntersectionObserver, parallax limitado e cleanup.
- src/styles/tokens.css: cores, espaços, raios, duração e camadas.
- src/styles/home.css e access.css: superfícies principais.
- src/styles/redesign.css e globals.css: componentes e responsividade.
- Nenhuma diferença em src/server em relação ao checkpoint. Sem novas dependências de animação; manifests preservados.

A referência SoFi orienta título à esquerda e colagem à direita. As duas referências de acesso orientam formulário estreito e fotografia lateral; Atlas e Brickwise orientam espaço, busca e leitura. A matriz completa está em REDESIGN_PROGRESS.md, e os tokens documentados em DESIGN.md.

## Assets e movimento
public/images/premium/hero-portrait.webp: retrato fictício, usado no hero e login; aproximadamente 70 KB.
public/images/premium/auth-care.webp: mãos dobrando tecido, usado na narrativa, no cadastro e recuperação; aproximadamente 96 KB.
Originais e prompts exatos: artifacts/redesign/assets/. O utilitário de proveniência usa sidecars .webp.json; scan confirmou 2 imagens e nenhuma sem origem. Os textos da interface identificam o caráter ilustrativo. A escultura anterior foi preservada porque a ferramenta legada de exportação ainda a referencia.

Fontes locais: public/fonts/manrope-latin.woff2 e licença OFL-Manrope.txt. Sem requisição de fonte ao Google em execução.

Movimento: entrada das linhas, máscara da fotografia, sequência da composição, imagem narrativa revelada no scroll, retorno tátil de controles e cabeçalho ao rolar. CSS, Web Animations API, IntersectionObserver e requestAnimationFrame; sem biblioteca adicional. prefers-reduced-motion desativa movimento; formulários não aguardam animações.

## Evidências
| Verificação | Resultado |
|---|---|
| npm.cmd run typecheck | Aprovado |
| npm.cmd run test:server | 11/11 aprovados |
| npm.cmd run build | Aprovado no código final |
| npm.cmd run test:live | 15/15 aprovados no build final |
| Captura de 37 telas em 375, 390, 768, 1024 e 1440 px | 185 verificações; nenhum overflow ou erro de página |
| Detector impeccable | Uma execução; nenhuma ocorrência |
| Proveniência das imagens novas | 2 rasters; nenhum sem origem |
| API local após testes | ready |

Capturas antes/depois: artifacts/redesign/before/ e artifacts/redesign/after/. Desktop 1440 e celular 390 têm screenshots integrais; demais larguras têm verificações registradas no results.json. Dados dessas capturas são sintéticos, sem alteração do banco real.

A suíte real cobre moderação, revisão de vaga, candidatura, mensagens, experiência, avaliação, relatório, autorização, privacidade, CSRF, concorrência, acessibilidade automatizada, encerramento de vínculos, recuperação de senha, revogação de sessões, suspensão e limite de tentativas. Usa banco temporário com limpeza no encerramento.

Revisão independente: artifacts/redesign/finish-review.md. Veredito final ship em artifacts/redesign/finish-verdict.md, restrito aos quatro ajustes solicitados: tipografia da seção de vagas, espaçamento dos painéis, remoção do rótulo decorativo de acesso e legibilidade do contrato. Todos resolvidos.

## Executar e retomar
Para desenvolvimento: npm.cmd run services, npm.cmd run db:migrate e npm.cmd run dev. Não repetir migrações se os serviços já estiverem prontos.
Para testes de navegador nesta máquina:
```powershell
$env:PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='C:/Users/ohtas/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe'
npm.cmd run test:live
npx.cmd tsx scripts/redesign-capture.ts after
```
Em outra máquina, instale o Chromium correspondente ao Playwright ou aponte essa variável para um executável compatível.

Checkpoint anterior: artifacts/redesign/checkpoint/. O diretório baixado não tinha metadados Git; não há commit ou PR associado. Preservar alterações novas ao restaurar qualquer arquivo.

## Limitações e operação
Não houve publicação externa; esta entrega está validada localmente. Consultar docs/CRIAR-CONTAS-E-PUBLICAR.md para implantação. Configuração de SMTP público, domínio e política institucional permanecem decisões de implantação.
A consulta Mobbin exigiu plano pago; as referências fornecidas orientaram a execução.
O ambiente usa Node 26 e emite aviso de depreciação; o projeto recomenda Node 24. Better Auth avisou que o servidor local não fornecia IP confiável para rate limiting; ao publicar atrás de proxy, configurar cabeçalhos e proxies confiáveis conforme o ambiente.
A verificação automatizada de acessibilidade cobre os cenários da suíte e não equivale a auditoria completa com leitores de tela ou dispositivos físicos.
O exportador legado scripts/export-visual-preview.ts é anterior ao redesign e não foi usado como evidência; use as capturas atuais e a plataforma executável. Não publicar seu HTML antigo como representação do novo projeto.

Documentos: PRODUCT.md, DESIGN.md, .impeccable/design.json, docs/REDESIGN-SURFACE.md e REDESIGN_PROGRESS.md.
