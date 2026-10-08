# Conecta SINTEDORP — Etapa 1: escopo e execução

## Situação desta etapa

Etapa 1 executada: revisão do checkout e consolidação dos requisitos para desenvolvimento. As Etapas 2 e 3 foram autorizadas e concluídas. A arquitetura está em `ETAPA-02-ARQUITETURA-E-FLUXOS.md`; os resultados do protótipo estão em `/workspace/SintedoRP/docs/ETAPA-03-RESULTADOS.md`. O usuário autorizou a continuidade sem novas pausas para permissão; a implementação funcional está documentada em `/workspace/SintedoRP/docs/ETAPAS-04-A-07-RESULTADOS.md`.

A inspeção atual de `/workspace/SintedoRP` encontrou um repositório local sem commits, na branch `work`, sem arquivos de aplicação. Não foram encontrados arquivos AGENTS.md nos locais inspecionados. O comando de histórico confirmou a ausência de commits; não se trata de falha de build. A situação do remoto não foi consultada novamente nesta etapa.

Base: análise dos três anexos e mensagens consolidada em `ANALISE-CONECTA-SINTEDORP.md`. Nenhuma dependência foi instalada e não há aplicação para testar nesta etapa.

## Como vamos trabalhar

- Prosseguir autonomamente nas etapas de desenvolvimento, conforme a autorização mais recente do usuário.
- Ao começar, indicar objetivo e modelo recomendado.
- Ao terminar, apresentar entregas, verificações, pendências e o conteúdo da próxima etapa.
- A solicitação inicial de aprovação a cada etapa foi substituída pelo pedido de continuidade sem pausas para autorização.
- A indicação de modelo é uma recomendação; não representa troca automática nem confirmação do modelo ativo na interface.
- Aprovar uma etapa técnica não aprova políticas institucionais, contratação de APIs ou publicação do sistema.

## Objetivo e versão-alvo

Proposta para aprovação: desenvolver um MVP funcional, precedido de protótipo navegável, para conectar trabalhadores domésticos a empregadores com mediação do sindicato. A experiência será em português e priorizará celular. O desenvolvimento e a demonstração inicial usarão dados fictícios identificados.

A solução terá três perfis autenticados: trabalhador, empregador (pessoa física ou jurídica) e equipe do sindicato. Visitantes poderão conhecer o projeto e consultar vagas aprovadas com informações públicas.

O protótipo permitirá validar telas e navegação. O MVP deverá ter backend, banco e permissões reais. A preparação para produção será uma etapa própria, depois da validação funcional.

## Requisitos rastreáveis

| ID  | Requisito                                  | Critério de conclusão                                                                                                                     |
| --- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| R01 | Cadastro de trabalhador e empregador PF/PJ | Conta persistida, validação no servidor, tratamento de duplicidades e seleção de tipo sem conceder privilégios administrativos.           |
| R02 | CPF e CNPJ                                 | Formato e verificadores aplicáveis validados; documento privado; resultado de consulta externa separado da validação local.               |
| R03 | Separação de perfis                        | Servidor bloqueia acesso a dados e operações de outro perfil ou proprietário, inclusive em requisições diretas.                           |
| R04 | Perfil profissional                        | Trabalhador mantém função, disponibilidade, região e experiências; campos privados ficam protegidos.                                      |
| R05 | Cadastro e análise de vagas                | Empregador envia vaga com condições e aceite versionado; sindicato aprova ou pede ajustes antes de publicação.                            |
| R06 | Pesquisa e filtros                         | Busca por função, região, jornada e remuneração retorna somente vagas publicadas; paginação e estados de vazio/erro funcionam.            |
| R07 | Candidaturas                               | Trabalhador se candidata uma vez por vaga, acompanha andamento e pode desistir; vagas encerradas não recebem novas candidaturas.          |
| R08 | Contato entre empregador e trabalhador     | Participantes autorizados trocam mensagens ou usam o fluxo de contato aprovado; terceiros não acessam o conteúdo.                         |
| R09 | Histórico de trabalho                      | Experiência autodeclarada e vínculo confirmado aparecem com origem e situação diferentes; acesso segue a política de visibilidade.        |
| R10 | Avaliação do empregador                    | Avaliação vinculada a experiência elegível, sem duplicidade, com moderação e contestação; publicação conforme política definida.          |
| R11 | Relatórios sobre empregadores              | Sindicato consulta dados por empregador/período e exporta informações autorizadas; totais conferem com os registros.                      |
| R12 | Responsividade e acessibilidade            | Fluxos críticos utilizáveis em celular e teclado; campos rotulados, foco visível, erros claros e ausência de rolagem horizontal indevida. |
| R13 | Administração sindical                     | Contas privilegiadas provisionadas por administração; aprovação, rejeição e suspensão registram responsável e motivo.                     |

Todos os requisitos continuam no escopo. O primeiro incremento funcional cobre R01–R07 e R13, incorporando R12. O segundo completa R08–R11. R02 começa com validação local e situação explícita de consulta não realizada; consulta real depende da definição do provedor e acesso autorizado.

## Regras propostas para prototipagem

Estas são hipóteses de trabalho, ainda não políticas oficiais do sindicato:

1. Vagas só ficam visíveis após aprovação sindical; mudança relevante nas condições exige nova análise.
2. Contato começa a partir de uma candidatura, em conversa privada entre os envolvidos, com possibilidade de denúncia ao sindicato.
3. Histórico não equivale a prova de vínculo; confirmação deve registrar responsável e origem.
4. Avaliações ficam inicialmente restritas ao autor e à equipe autorizada; exposição pública depende de política de moderação e contestação.
5. Documentos, contato e endereço residencial completo não aparecem em páginas públicas.
6. Regras salariais e de jornada não terão valores legais inventados; fonte, vigência e manutenção serão definidas com o sindicato.

Cursos e emissão de certificados ficam propostos para evolução posterior. Relatório acadêmico e banner são entregas acadêmicas separadas do módulo de relatórios do sistema.

## Jornada a validar

Empregador se cadastra → envia vaga e aceita regras → sindicato analisa → vaga aprovada aparece na busca → trabalhador se candidata → contato autorizado → registro do resultado → histórico e eventual avaliação → acompanhamento em relatórios sindicais.

Testes futuros devem demonstrar essa jornada e também impedir: autocadastro como sindicato, publicação sem aprovação, leitura de conversa alheia, alteração de vaga de outro empregador e acesso indevido a documentos pessoais.

## Etapas, entregas e modelos recomendados

| Etapa                     | Entrega para revisão                                                                   | Modelo recomendado | Situação                                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------- |
| 1. Escopo                 | Requisitos, hipóteses, prioridades e plano de execução                                 | GPT-6.1 Sol        | Concluída; avanço autorizado pelo usuário                                                      |
| 2. Arquitetura e fluxos   | Escolha justificada da stack, modelo de dados, permissões, estados e mapa de telas     | GPT-6 Astra        | Concluída; ver ETAPA-02-ARQUITETURA-E-FLUXOS.md; Etapa 3 concluída                             |
| 3. Protótipo navegável    | Telas dos três perfis, navegação e estados com dados fictícios, verificados em celular | GPT-6.1 Sol        | Concluída; ver /workspace/SintedoRP/docs/ETAPA-03-RESULTADOS.md; núcleo funcional implementado |
| 4. Núcleo funcional       | Cadastro, autenticação, banco, vagas, aprovação, busca e candidaturas com testes       | GPT-6.1 Sol        | Implementada/validada; ver resultados das Etapas 4–7                                           |
| 5. Módulos complementares | Contato, histórico, avaliações e relatórios integrados e testados                      | GPT-6.1 Sol        | Implementada/validada; ver resultados das Etapas 4–7                                           |
| 6. Validação e revisão    | Revisão de autorização, testes de ponta a ponta, acessibilidade, build e correções     | GPT-6 Astra        | Implementada/validada; ver resultados das Etapas 4–7                                           |
| 7. Preparação da entrega  | Instruções reproduzíveis, configuração de ambiente, documentação e plano de publicação | GPT-6.1 Sol        | Implementada/validada; ver resultados das Etapas 4–7                                           |

GPT-6.1 Sol também pode executar as etapas 2 e 6 se Astra não estiver disponível no seletor. A recomendação de Astra nessas etapas privilegia análise de regras e revisão de riscos; não constitui garantia de qualidade ou requisito técnico do projeto.

A etapa 7 prepara a entrega para revisão. Publicação externa será uma ação explícita posterior, com destino e configuração definidos.

## Decisões pendentes e momento necessário

| Decisão                                             | Hipótese útil agora                                   | Quando precisa ser resolvida                                  |
| --------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------- |
| Entrega acadêmica e prazo                           | MVP funcional, com protótipo como marco intermediário | Antes de fechar compromisso de prazo e entrega com orientador |
| Stack e familiaridade da equipe                     | Avaliar Next.js/TypeScript/PostgreSQL na etapa 2      | Antes da estruturação do protótipo executável                 |
| Identidade visual oficial                           | Proposta visual provisória, identificada como tal     | Validação visual e publicação                                 |
| Elegibilidade de vagas e regras trabalhistas        | Revisão manual pelo sindicato no desenho do fluxo     | Antes de operação com vagas reais                             |
| Visibilidade de avaliações e confirmação de vínculo | Avaliações restritas e confirmação explícita          | Antes de concluir regras reais do módulo na etapa 5           |
| Provedor de CPF/CNPJ                                | Validação local, sem consulta real                    | Antes da integração externa                                   |
| Hospedagem, domínio e responsável por dados         | Desenvolvimento local e dados fictícios               | Antes da publicação e uso com dados reais                     |

## Verificação desta etapa

- Documento anterior e requisitos enviados foram revisados.
- Todos os elementos funcionais da lista do usuário estão mapeados em R01–R13.
- Permissões por etapa e recomendações de modelo foram registradas.
- Checkout inspecionado: sem código e sem commits locais.
- Nenhum teste de aplicação foi executado: ainda não há aplicação.

## Registro da autorização para a Etapa 2

A Etapa 2 foi autorizada para detalhar arquitetura, banco de dados, permissões, estados e mapa de telas do MVP proposto. A implementação do protótipo na Etapa 3 exige nova autorização, conforme o fluxo solicitado pelo usuário.

## Continuidade autorizada

O usuário determinou continuidade sem novas pausas para autorização. As etapas funcionais foram executadas no checkout; a publicação institucional depende das configurações externas descritas na documentação atual.
