# Redesign editorial — 8 de outubro de 2026

## Escopo e plano
1. Auditar rotas, estilos e referências; preservar checkpoint e capturas iniciais.
2. Implementar tokens, tipografia local, navegação, home e acesso.
3. Aplicar sistema às páginas operacionais e demonstração.
4. Integrar imagens autorais e movimento com redução respeitada.
5. Executar verificação responsiva, acessibilidade, fluxos reais e build.
6. Corrigir achados em lote e registrar evidências e continuidade.

## Diagnóstico
Há três camadas visuais (globals, redesign e home) com tratamentos distintos. A home escultórica e tipografia em caixa alta destoam das referências. Login/cadastro são formulários sem imagem editorial; áreas operacionais acumulam bordas e superfícies. A arquitetura funcional é adequada: o redesign não precisa alterar backend.

O checkout baixado não contém .git. Foi salvo um checkpoint integral de src e dos manifests em artifacts/redesign/checkpoint antes das mudanças. As capturas usam as 37 telas sintéticas existentes; não alteram dados reais.

## Matriz de referências
| Referência | Leitura visual | Aplicação |
|---|---|---|
| 1 — retrato P&B e ação laranja | Duas metades; formulário estreito e centrado; retrato em escala; tipografia limpa; cor no botão; bordas sutis | Login, recuperação e redefinição de senha com formulário à esquerda e fotografia autoral à direita |
| 2 — gravura pontilhada | Grande campo branco, imagem gráfica lateral, contraste preto/branco, controles baixos e arredondados | Cadastro na mesma composição de acesso, com detalhe pontilhado discreto e arte de cuidado. Sem login social inexistente |
| 3 — Atlas | Hierarquia central forte, navegação silenciosa, grande respiro, figura subordinada ao título, prova reunida em uma faixa | Ritmo da home e faixa de categorias; sem logos ou métricas inventados |
| 4 — Brickwise | Busca integrada ao hero, interfaces com bordas suaves, conteúdo agrupado por propósito | Busca de vagas, filtros e cartões; região permanece textual, sem mapa que prometa geolocalização |
| 5 — SoFi | Título à esquerda, colagem assimétrica à direita, preto sobre branco, botões em cápsula, acento muito contido | Estrutura principal do hero: título e ações à esquerda, retrato P&B e módulo de apoio sindical à direita |

## Direção escolhida
Branco mineral, tinta quase preta e laranja vivo em pequenos pontos e ações de acesso. Manrope variável local: desenho geométrico próximo às referências, boa leitura em português, uma família para todos os papéis. Retratos e gestos do cuidado em P&B. Espaço e composição dão a hierarquia; painéis priorizam leitura e ações.

O briefing já determina público, fluxos, referências, prioridade e execução autônoma. Essas respostas substituem as rodadas de descoberta/seleção da skill. Nesta sessão, implementação direta guiada pelas referências; não gravar preferência de workflow em nome do usuário.

## Pesquisa e skills
Aplicadas: frontend-design, CodeMakers-Design, impeccable, imagegen e humanizer. Skills adicionais citadas sem instalação local não são necessárias para duplicar essas funções; fontes oficiais consultadas quando disponíveis. A consulta ao MCP Mobbin retornou exigência de plano pago; nenhuma referência foi obtida por ele. As referências do usuário permanecem a autoridade visual.

## Progresso
- [x] Arquitetura e fluxos identificados; checkpoint salvo.
- [x] Cinco referências analisadas.
- [x] Implementação integral.
- [x] Assets gerados e integrados.
- [x] Verificação e crítica visual.
- [x] Handoff e resultados.

Entrega local concluida; resultados e limites em REDESIGN_HANDOFF.md. Revisao final: artifacts/redesign/finish-verdict.md.
