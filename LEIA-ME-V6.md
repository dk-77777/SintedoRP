# Conecta SINTEDORP — entrega V6

Redesign aplicado à versão V3 recebida no ZIP limpo. Inclui hero cinematográfico, Conecta Flow animado, transição escuro/marfim, quatro novas fotografias, login/cadastro e refinamentos das áreas internas.

## Ver sem instalar
Abra `artifacts/previa-visual/Conecta-SINTEDORP-previa.html` no navegador. São 37 telas navegáveis com dados fictícios. Esta prévia é estática: formulários não gravam dados e as animações completas estão na aplicação e no vídeo `artifacts/cinematic-v6/conecta-motion.mp4`.

## Executar a aplicação
1. Extraia em uma pasta separada da sua cópia atual.
2. Use Node.js 24 e execute `npm ci`.
3. Configure seu `.env.local` com o banco, e-mail e segredos que você já usa localmente, seguindo o exemplo do projeto. O pacote não contém credenciais.
4. Execute `npm run dev` e abra `http://localhost:3000`.
5. Use a plataforma live (padrão). `APP_MODE=prototype` abre a demonstração legada, cuja home não é a V6.

Para testar, use os comandos descritos em `docs/ai-development/HANDOFF.md`. As instruções originais do backend continuam no README.md.

## Validação
TypeScript e build aprovados. 11 testes de servidor, 15 do modo demonstrativo e 20 live passaram. A suíte live usa banco temporário e sessões reais. Também foram verificadas 37 telas em cinco larguras: 185 casos sem overflow ou exceções. Cinco testes dirigidos de motion/acessibilidade foram repetidos no build final após o último refinamento visual.

## Conteúdo
- `src/`, `public/`, `scripts/`, `tests/`: aplicação e verificações.
- `docs/ai-development/`: plano, decisões, motion, origem das imagens, validação e handoff.
- `artifacts/creative-direction/`: quatro estudos originais em HTML e PNG.
- `artifacts/cinematic-v6/final/`: home final nas cinco larguras.
- `artifacts/cinematic-v6/before/` e `after/`: amostras e resultados da matriz.
- `artifacts/previa-visual/`: prévia independente.

Referências visuais externas não vieram como imagens; a direção usa as descrições do briefing e os estudos próprios. As fotografias representam pessoas fictícias. As medições locais de performance não certificam resultados de produção. Nada foi publicado automaticamente.
