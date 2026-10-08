# Prompt de redesign completo — Conecta SINTEDORP

Use o MASTER UNIVERSAL V5 como referência de processo, especialmente as seções de inspeção do projeto, direção artística, Anti AI-Slop, redesign, design system, responsividade e verificação. Adapte essas orientações à tarefa abaixo.

## Objetivo e contexto

Execute um redesign completo do Conecta SINTEDORP, plataforma que conecta trabalhadores domésticos, empregadores e sindicato em Ribeirão Preto e região. O visual atual transmite uma aparência genérica de site produzido por IA: caixas repetidas, cards em excesso, composição previsível e elementos decorativos sem função. Investigue as telas reais para confirmar cada problema.

Quero uma identidade premium, minimalista, humana e direta. Redesenhe a composição, a hierarquia, a navegação e os componentes do site inteiro. Uma troca de cores ou de bordas é insuficiente para esta tarefa.

## Inspeção e referências

Antes de editar, leia AGENTS.md, README, package.json, as rotas e o código em src/live, src/components e src/styles. Identifique qual interface está ativa e inventarie todas as telas públicas e autenticadas dos três perfis. Preserve as alterações locais existentes.

Selecione somente skills disponíveis e pertinentes a design, textos, acessibilidade e frontend. Se existirem, considere frontend-design, redesign-existing-projects, copywriting e operadores de critique, distill, typeset e polish. Nunca afirme ter usado uma skill ou ferramenta indisponível.

Pesquise referências reais quando houver ferramentas para isso. Use Mobbin somente se houver acesso funcional. Registre a origem das referências e explique quais princípios serão adaptados. Escolha uma direção própria para o produto, sem reproduzir telas de outros serviços.

## Direção visual

Conceito: uma plataforma de trabalho com clareza de um serviço público bem desenhado e acabamento de uma publicação contemporânea. A identidade deve transmitir respeito, confiança e proximidade, sem aparência de startup tecnológica genérica.

Mantenha a paleta laranja já escolhida:
- Laranja queimado #AF4513: ações principais e destaques pontuais.
- Marfim #FCFAF7: fundo predominante.
- Creme #F6EEE5: superfícies secundárias.
- Carvão quente #2D241F: texto e áreas de contraste.
- Divisórias discretas #E4D6C9.

Use superfícies sólidas. Remova gradientes decorativos, glow, glassmorphism, blobs, sombras exageradas, cápsulas decorativas e grandes arredondamentos repetidos. Cores de sucesso, alerta e erro devem conservar significado e contraste.

Construa a personalidade com tipografia, proporção, alinhamento, ritmo e espaço. Combine uma tipografia editorial nos títulos públicos com uma fonte altamente legível na interface. Limite a duas famílias e poucos pesos. Evite títulos enormes, texto minúsculo e excesso de palavras em caixa alta.

Cards precisam ter uma função concreta de agrupamento ou interação. Prefira listas, linhas, divisórias, tabelas, blocos abertos e áreas de leitura quando essas estruturas forem mais claras. Evite caixas dentro de caixas e grades de três cards idênticos. Use ícones somente quando ajudarem a compreender uma ação.

## Composição por área

- **Página inicial:** cabeçalho limpo, proposta em uma frase e busca de vagas em destaque. Composição editorial com alinhamentos claros; oportunidades em lista; orientação breve para trabalhadores e empregadores. Retire painéis fictícios e seções repetidas de benefícios.
- **Vagas:** resultados em linhas legíveis com função, localização, remuneração quando informada e condições essenciais. Filtros claros no desktop e painel acessível no celular. Detalhe da vaga com leitura contínua e candidatura fácil de localizar.
- **Acesso e cadastro:** formulários objetivos, hierarquia clara e escolha de perfil compreensível. Agrupe dados relacionados; mantenha labels visíveis e instruções necessárias. Evite transformar cada campo ou etapa em um card.
- **Área do trabalhador:** destaque a próxima ação útil, candidaturas e conversas. Histórico como sequência de registros; avaliações com autoria, contexto e situação claramente apresentados.
- **Área do empregador:** vagas e candidatos em listas ou tabelas apropriadas. Ações claras para publicar, acompanhar e responder. Evite métricas decorativas e painéis de números sem utilidade.
- **Área do sindicato:** organização de filas de moderação, atendimentos, cadastros e relatórios. Informação mais densa no desktop, com prioridades e estados legíveis. Adapte a estrutura para celular sem apenas reduzir uma tabela larga.
- **Mensagens e atendimento:** composição de conversa e acompanhamento de solicitações, com contexto e estados claros.
- **Páginas institucionais e privacidade:** leitura editorial, títulos informativos e conteúdo essencial organizado.

Cada tela deve refletir sua tarefa. Preserve uma identidade comum sem repetir o mesmo layout em todas as páginas.

## Textos e funcionalidade

Escreva em português brasileiro, com títulos concretos, frases curtas e botões que descrevam ações. Elimine slogans repetidos, explicações óbvias e termos técnicos nos fluxos. Preserve informações indispensáveis sobre condições de trabalho, consentimento, privacidade, erros e consequências das ações.

Preserve autenticação, recuperação de acesso, CPF/CNPJ, perfis e permissões, publicação e moderação de vagas, candidaturas, conversas autorizadas, histórico, confirmação de encerramento, avaliações, atendimento e relatórios. Não altere regras do backend para simplificar a interface. Validação de dígitos de CPF/CNPJ não deve ser apresentada como verificação oficial de identidade.

Mantenha a stack e as integrações existentes. Não invente dados, depoimentos, estatísticas, contatos oficiais ou integrações concluídas. Dados de demonstração devem ser identificados como exemplos.

## Execução e entrega

Registre primeiro um diagnóstico breve e uma direção visual concreta. Depois implemente o redesign em todas as rotas inventariadas, reutilizando componentes e tokens sem acumular CSS de sobrescrita ou manter sistemas visuais concorrentes.

Projete o celular intencionalmente: navegação simples, filtros acessíveis, formulários confortáveis e ações fáceis de tocar. Garanta contraste, labels, foco visível, teclado, estados de carregamento, vazio, erro, sucesso e indisponibilidade. Animações devem explicar mudanças de estado e respeitar prefers-reduced-motion.

Inspecione as telas no navegador em 360, 390, 768 e 1440 px, incluindo conteúdos longos e diferentes estados. Verifique os fluxos afetados e execute as verificações técnicas pertinentes existentes. Corrija os problemas encontrados. Não declare verificações que não executou.

Entregue uma prévia visual atualizada para download, capturas das principais telas e uma relação das rotas revisadas, mudanças e limitações. Diferencie prévia visual de aplicação conectada ao backend. Não publique, faça push ou configure serviços externos nesta tarefa.

Critério de conclusão: mudança perceptível de composição em todas as áreas, textos mais diretos, redução justificada de cards, ausência de gradientes decorativos, identidade laranja coerente, boa leitura no celular e preservação dos fluxos existentes. Se ainda parecer um template genérico, revise a composição antes da entrega.
