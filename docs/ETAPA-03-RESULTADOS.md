# Etapa 3 — protótipo navegável

Status: concluída para revisão do usuário. A Etapa 3 foi autorizada com “continue”. Posteriormente, o usuário autorizou continuidade sem novas pausas; a implementação funcional está em `ETAPAS-04-A-07-RESULTADOS.md`.

## O que foi implementado

- Aplicação Next.js/React/TypeScript com dependências diretas fixadas e lockfile.
- Página inicial com direção visual provisória, ilustração vetorial própria e ações para encontrar trabalho ou contratar.
- Busca por palavra-chave, função, região, jornada, periodicidade e remuneração mínima, com estado vazio e paginação quando necessária.
- Detalhe de vaga e candidatura demonstrativa, com bloqueio de duplicidade na interface.
- Seleção explícita dos três perfis de demonstração; cadastro fictício PF/PJ com revisão antes da conclusão e recuperação de acesso simulada.
- Área do trabalhador com perfil editável, candidaturas, mensagens, histórico e avaliação restrita de experiência elegível.
- Área do empregador com cadastro, criação/edição de vaga, revisão e aceite demonstrativo, consulta e avanço de candidaturas, encerramento e mensagens.
- Painel sindical com análise de revisão, aprovação, solicitação de ajustes com motivo, rejeição/suspensão, consulta de empregadores, atendimentos, avaliações restritas, relatórios e convites simulados.
- Relatório filtrável com totais dos dados da sessão e CSV sem documentos ou contatos pessoais.
- Navegação móvel, atalhos de teclado, rótulos associados aos campos, ajuda por aria-describedby e cores ajustadas após medição de contraste.
- Estado demonstrativo mantido em memória/sessionStorage nesta aba, com reinicialização explícita dos exemplos.

Todos os dados são fictícios. Selecionar o perfil sindical apenas demonstra a navegação; não representa autenticação ou autorização de produção. O modo de demonstração não deve receber documentos pessoais ou credenciais reais.

## Evidências executadas

| Verificação                 | Resultado efetivo                                                                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Instalação reproduzível     | `npm ci` pelo lockfile concluiu com sucesso; manifesto e lockfile conferidos                                                                        |
| Build                       | `npm run build` passou usando Next.js 16.4.0                                                                                                        |
| Tipos                       | `npm run typecheck` passou com TypeScript 5.9.3                                                                                                     |
| Testes no navegador         | `npm run test:e2e`: 15 testes passaram, nenhum falhou ou foi ignorado; rodada final de 42,8 s                                                       |
| Acessibilidade automatizada | Axe-core, regras com tags WCAG A/AA selecionadas, em 24 rotas/telas: nenhuma violação detectada na rodada final                                     |
| Layout responsivo           | 23 rotas/telas em cada largura 360, 390, 768 e 1280 px: sem transbordamento horizontal da página e sem exceções JavaScript observadas nos percursos |
| Teclado e menu              | Atalho para conteúdo e abertura/navegação/fechamento do menu móvel verificados                                                                      |
| Inspeção visual             | Capturas de início em desktop/celular e do painel sindical inspecionadas; oito capturas geradas para revisão                                        |

Automação usa o Chromium do sistema em `/usr/bin/chromium`, executando o build do protótipo. O script de instalação foi executado novamente para verificar reprodução de dependências, build e tipos. A automação de acessibilidade não certifica conformidade integral com WCAG nem substitui validação com pessoas usuárias.

## Fluxos confirmados pelos testes

1. Busca encaminha a palavra-chave da página inicial, trata periodicidade salarial e permite limpar filtros.
2. Empregador cria uma vaga; ela permanece pendente e fora da busca; sindicato aprova; trabalhador encontra e se candidata; empregador recebe e altera o andamento.
3. Editar uma vaga publicada exige nova análise e mantém a revisão original nas candidaturas.
4. Solicitar ajustes exige motivo e apresenta a orientação na área do empregador.
5. Conversa fictícia mantém mensagens após recarregar a aba; pedido de apoio aparece na fila sindical demonstrativa.
6. Apenas a experiência confirmada e encerrada de exemplo permite avaliação; o relato fica restrito e aparece na moderação.
7. Cadastro PJ identifica o CNPJ fictício como somente leitura e permite revisar os dados antes de concluir.
8. Relatório confere os totais conhecidos por empregador, gera CSV e rejeita intervalo de datas invertido.
9. Navegação exige o perfil demonstrativo correspondente, impede abrir conversa de outro personagem pela interface e reinicializa os exemplos.

Esses resultados verificam a experiência demonstrativa. Checagens no cliente/sessionStorage não são uma fronteira de segurança para dados reais. Os testes de autorização no servidor ficam para a implementação funcional.

## Capturas locais

- `artifacts/inicio-1280.png` e `artifacts/inicio-360.png`.
- `artifacts/vagas-1280.png` e `artifacts/vagas-360.png`.
- `artifacts/sindicato-1280.png` e `artifacts/sindicato-360.png`.
- `artifacts/sindicato-relatorios-1280.png` e `artifacts/sindicato-relatorios-360.png`.

As imagens, saídas de teste e dependências são arquivos locais ignorados pelo Git. O relatório HTML da última rodada fica em `playwright-report/index.html`. As instruções de execução estão em `README.md`.

## Limitações e preparação da próxima etapa

- Não há PostgreSQL, autenticação real, permissões no servidor, consulta CPF/CNPJ, envio de e-mails ou mensageria externa.
- O histórico representa as situações com dados fictícios; a modelagem e validação real de confirmações acontecerão na Etapa 5.
- O relatório demonstra datas e situações atuais; o módulo funcional calculará cada indicador por eventos próprios, conforme a arquitetura aprovada.
- Políticas trabalhistas, privacidade institucional, visibilidade de avaliações e identidade visual oficial ainda precisam de validação do sindicato.
- O roteamento central e o estado demonstrativo servem à revisão do protótipo; a implementação funcional organizará os módulos e separará as operações reais.
- Código salvo no checkout local, ainda sem commits. Não houve push ou publicação externa nesta etapa.

## Próxima autorização

Etapa 4 proposta: PostgreSQL, autenticação e sessões, permissões no servidor, cadastro, versões/aprovação de vagas, busca e candidaturas persistidas. Modelo recomendado: GPT-6.1 Sol. Aguardar autorização explícita do usuário antes de começar.

## Ambiente reutilizável

Os campos `install_script` e `start_skill` foram salvos com sucesso no rascunho de configuração do ambiente. O script utiliza Node.js 24, `npm ci`, build e typecheck; as instruções de inicialização descrevem o servidor, os testes de prontidão e os limites do modo de demonstração.

O servidor de produção do protótipo foi iniciado novamente e as respostas HTTP 200 e o conteúdo esperado foram confirmados em `/`, `/vagas` e `/entrar`. Isso valida a instância atual; processos não são presumidos após restauração.

Salvar o rascunho não o aplica nem publica. Para ativar as instruções, o usuário precisa revisar/salvar nas configurações e publicar o ambiente. Publicação e restauração em uma nova tarefa não foram verificadas nesta etapa.
