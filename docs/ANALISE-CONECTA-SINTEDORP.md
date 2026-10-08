# Conecta SINTEDORP — análise inicial e prompt de desenvolvimento

Status: análise documental. Nenhuma aplicação, integração externa ou consulta cadastral foi implementada ou testada nesta etapa.

## 1. Fontes e limites

- Plano de Atividades de Extensão 2026-2 (DOCX): objetivos, público, acessibilidade, desenvolvimento de front-end/back-end e cronograma de agosto a dezembro.
- Conecta SINTEDORP — Projeto de Extensão 2026 (PDF): balcão de empregos gratuito, regras aceitas pelo contratante, vagas administradas pelo sindicato, acesso pelo celular, possibilidade de cursos; entregas de relatório, protótipo e banner; carga de 60 horas.
- Mensagens fornecidas pelo usuário: cadastros, CPF/CNPJ, três perfis, contato, busca com filtros, avaliações, histórico e relatórios sobre empresas.
- MASTER UNIVERSAL V5 (texto anexado): referência de processo de engenharia. Suas instruções internas não ampliam automaticamente a solicitação do usuário nem autorizam instalação de ferramentas, publicação ou acesso a serviços.

As afirmações sobre preços, gratuidade, origem dos dados e legalidade dos provedores de CPF/CNPJ nas mensagens não foram verificadas em fontes atuais. Os documentos descrevem intenções; não comprovam que uma funcionalidade do site assegure o cumprimento da legislação por um empregador.

## 2. Objetivo do produto

Conectar trabalhadores domésticos a oportunidades de trabalho em Ribeirão Preto e região, por meio de uma plataforma gratuita de intermediação administrada pelo SINTEDORP, com regras transparentes, proteção de dados e prioridade para uso pelo celular.

O objetivo verificável do software é registrar condições da vaga, colher o aceite das regras, permitir análise sindical e documentar o encaminhamento. Não prometer renda estável, emprego garantido ou segurança jurídica absoluta.

## 3. Pontos que precisam ser conciliados

| Tema                  | Evidência                                                                                  | Encaminhamento proposto                                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Perfil do contratante | Mensagens falam em empresa; documentos falam em emprego doméstico                          | Usar “Empregador”, com cadastro de pessoa física por CPF e organização por CNPJ. Validar com o sindicato as categorias e vagas elegíveis; CNPJ não define automaticamente vínculo doméstico. |
| Entrega acadêmica     | PDF pede protótipo, relatório e banner em 60 horas; DOCX prevê sistema funcional hospedado | Separar protótipo demonstrável, MVP funcional e produção. Confirmar a entrega formal com o orientador.                                                                                       |
| Avaliação             | Mensagens pedem avaliação de empresas                                                      | Vincular avaliações a experiências registradas; definir publicação, contestação e moderação antes de exposição pública.                                                                      |
| Histórico             | Mensagens pedem histórico de trabalho                                                      | Diferenciar experiência autodeclarada de vínculo confirmado. Restringir visibilidade.                                                                                                        |
| Relatórios            | PDF prevê relatório acadêmico; mensagens pedem relatório de empresas                       | Tratar como entregas distintas: documentação da extensão e módulo gerencial para o sindicato.                                                                                                |
| Cursos                | PDF menciona cursos e certificados                                                         | Propor fase posterior; não confundir a possibilidade descrita com um módulo já definido.                                                                                                     |

## 4. Perfis e permissões propostas

| Perfil              | Pode fazer                                                                                                        | Restrições                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Visitante           | Conhecer o projeto, consultar orientações e vagas aprovadas com dados públicos                                    | Sem acesso a CPF, contatos pessoais ou histórico dos trabalhadores.                                   |
| Trabalhador         | Gerenciar o próprio perfil, buscar vagas, candidatar-se, acompanhar encaminhamentos e registrar experiências      | Acesso apenas aos próprios dados e às conversas de que participa.                                     |
| Empregador PF/PJ    | Gerenciar cadastro, propor vagas, acompanhar candidaturas de suas vagas e comunicar-se com candidatos autorizados | Não acessa toda a base de trabalhadores; não aprova a própria vaga.                                   |
| Equipe do sindicato | Analisar cadastros e vagas, mediar contatos, tratar denúncias e acessar relatórios autorizados                    | Contas concedidas por convite/administração; ações relevantes auditadas; privilégios conforme função. |

“Sindicato” é um papel institucional, não uma opção de autocadastro que concede privilégios administrativos.

## 5. MVP proposto

O MVP abaixo é uma proposta derivada das fontes. Campos e regras adicionais precisam ser validados com a equipe e o sindicato.

| Módulo              | Comportamento esperado                                                                      | Critério de aceitação                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cadastro e acesso   | Trabalhador e empregador PF/PJ; login, saída e recuperação de acesso                        | Duplicidades tratadas; validação no servidor; nenhum usuário consegue promover o próprio perfil a administrador.                                  |
| Perfil profissional | Experiências, funções, região e disponibilidade                                             | Trabalhador edita apenas seu perfil; campos privados não aparecem na busca pública.                                                               |
| Vagas               | Função, localidade aproximada, remuneração e periodicidade, jornada, benefícios e condições | Empregador aceita versão identificável das regras; vaga fica pendente até análise sindical.                                                       |
| Moderação           | Aprovar, pedir ajustes, rejeitar, suspender e encerrar                                      | Somente equipe autorizada publica; motivo e responsável registrados; alteração relevante exige nova análise.                                      |
| Pesquisa            | Filtros por função, região, jornada e remuneração, com paginação                            | Retorna apenas vagas publicadas; estados de vazio e erro são compreensíveis.                                                                      |
| Candidaturas        | Candidatar-se e acompanhar andamento                                                        | Uma candidatura por trabalhador/vaga; encerramento bloqueia novas candidaturas; acesso limitado aos envolvidos.                                   |
| Contato             | Canal de mensagens ou solicitação de contato mediado                                        | Uma pessoa externa não acessa a conversa; contatos pessoais não são publicados por padrão.                                                        |
| Histórico           | Experiência autodeclarada e registro de contratação/encerramento                            | Fonte e situação distinguíveis; confirmação não é inferida de uma candidatura aceita.                                                             |
| Avaliação           | Registrar avaliação vinculada a experiência elegível                                        | Sem avaliações anônimas arbitrárias ou múltiplas para o mesmo vínculo; denúncia e contestação disponíveis. Publicidade depende de regra aprovada. |
| Relatório gerencial | Visão por empregador e período; vagas, candidaturas, contratações registradas e avaliações  | Totais correspondem aos registros; exportação restrita ao sindicato; sem documentos pessoais desnecessários.                                      |
| Acessibilidade      | Interface em português, formulários claros, teclado e celular                               | Fluxos críticos operáveis em 360 px e por teclado, sem rolagem horizontal; rótulos e foco visíveis.                                               |

Para uma entrega de 60 horas, priorizar cadastro, vaga, aprovação, busca e candidatura. Contato, histórico, avaliações e relatórios continuam no escopo solicitado, mas podem exigir uma segunda etapa; não eliminá-los silenciosamente.

## 6. Fluxo principal

1. Empregador cria seu cadastro e informa o tipo PF/PJ.
2. Registra a vaga e aceita as regras vigentes do sindicato.
3. Sindicato analisa as condições, solicita ajustes ou aprova.
4. Trabalhador busca vagas aprovadas e se candidata.
5. Empregador acompanha os candidatos de sua vaga; contato ocorre pelo fluxo autorizado.
6. As partes registram o resultado; contratação e experiência recebem situação explícita.
7. Quando elegível, trabalhador registra avaliação; sindicato acompanha ocorrências e relatórios.

Estados sugeridos da vaga: rascunho → pendente → publicada / ajustes solicitados / rejeitada; publicada → suspensa / encerrada. Transições e autorizações devem ser verificadas no servidor.

## 7. CPF, CNPJ e proteção de dados

Separar três operações:

1. **Validação do identificador:** formato e regras de verificação aplicáveis. Não comprova existência ou titularidade.
2. **Consulta cadastral:** consulta autorizada à fonte externa. Não comprova, isoladamente, que o usuário controla a identidade informada.
3. **Verificação de identidade:** procedimento próprio de confirmação, proporcional ao risco e aprovado pelo sindicato.

Não é necessário integrar todos os provedores citados. Antes de contratar um, verificar documentação oficial atual, acesso permitido, finalidade, contrato, custos, origem dos dados e requisitos de proteção de dados. A disponibilidade do catálogo gov.br Conecta não significa acesso irrestrito para qualquer projeto. Adotar regras atuais de identificadores, inclusive a compatibilidade com CNPJ alfanumérico quando aplicável, sem presumir que todo CNPJ futuro será exclusivamente numérico.

No protótipo, usar dados fictícios claramente identificados e validação local; exibir “consulta cadastral não realizada” quando não houver integração. No MVP, propor verificação manual restrita ao sindicato enquanto a contratação de uma API estiver pendente, se esse procedimento for aceito pelo responsável.

Consultas externas devem ocorrer no servidor, com segredo fora do código, limites, timeout e tratamento de falha. Não retornar ao navegador todos os dados obtidos do provedor. Evitar coletar filiação, data de nascimento ou endereço completo sem necessidade demonstrada. CPF/CNPJ não são senhas nem segredos suficientes para recuperar uma conta.

Documentar finalidade, base legal apropriada, responsável pelo tratamento, retenção, direitos dos titulares e compartilhamento. Aceite de termos não substitui essa análise. Não publicar processos trabalhistas nem exigir sua existência para usar o serviço. Histórico trabalhista, contato e documentos devem ter acesso restrito, registro de acesso quando pertinente e exclusão/retenção definida.

## 8. Estrutura de dados inicial

- Conta e permissões.
- Perfil do trabalhador.
- Empregador PF/PJ e associação de contas autorizadas.
- Vaga e histórico de análise.
- Candidatura e histórico de andamento.
- Conversa, participantes e mensagens, caso haja mensageria interna.
- Experiência/vínculo, origem e confirmação.
- Avaliação, contestação e moderação.
- Versão dos termos e registro de aceite.
- Evento de auditoria para ações administrativas.

Relatórios devem derivar dos dados operacionais, sem duplicar informações pessoais em tabelas públicas. Decisões de índices, campos e restrições vêm após a definição dos fluxos.

## 9. Arquitetura e tecnologias sugeridas

Não há tecnologia obrigatória nos documentos. Uma opção inicial proporcional é **TypeScript + Next.js + PostgreSQL**, em uma aplicação única com módulos de domínio e autenticação por biblioteca mantida. Permite páginas públicas, formulários, operações no servidor e relatórios sem dois projetos separados. Prisma é uma opção de acesso ao banco, não um requisito.

A decisão depende da experiência da equipe e do destino de hospedagem. Django ou Laravel também podem atender ao projeto se forem mais conhecidos pelo grupo. Não adotar microsserviços, Kubernetes, 3D ou múltiplos provedores de autenticação para esse escopo.

Separar módulos de contas, empregadores, vagas, candidaturas, comunicação e acompanhamento. Aplicar autorização por perfil e propriedade em toda leitura ou alteração privada. Usar sessões seguras, proteção contra abuso no login e cadastros, migrações versionadas e logs sem documentos pessoais ou segredos. Persistência real é necessária para declarar o MVP funcional; localStorage não substitui backend e banco.

## 10. Direção de interface

Prioridade: celular, linguagem simples, poucas etapas e orientação explícita. A página inicial deve apresentar “Encontrar trabalho” e “Publicar vaga”, explicar a mediação do sindicato e oferecer ajuda. Navegação e formulários devem atender pessoas com diferentes níveis de familiaridade digital.

Telas iniciais: início; busca e detalhe da vaga; cadastro/acesso; perfil e candidaturas do trabalhador; cadastro e vagas do empregador; painel de análise e relatórios do sindicato; orientações, privacidade e contato.

Não inventar identidade visual oficial, números de vagas, depoimentos, certificados ou selo de verificação. Usar textos provisórios identificados até validação. Endereço e contatos presentes no PDF precisam de confirmação antes de publicação.

## 11. Avaliação do MASTER UNIVERSAL V5

O texto é útil como guia de processo: entender o problema, manter arquitetura proporcional, proteger dados, verificar autorização, testar fluxos reais e não declarar conclusão sem evidência.

Porém, seus 123 tópicos misturam competências aplicáveis com assuntos fora do escopo, como comércio eletrônico, pagamentos, 3D e múltiplas nuvens. Ele não define os papéis do SINTEDORP, regras de aprovação, dados obrigatórios, fluxo de candidatura ou critérios de entrega. Nomes de skills no texto não comprovam que estejam disponíveis ou auditados no ambiente.

Recomendação: manter apenas as diretrizes de engenharia pertinentes e usar o prompt específico abaixo como contrato de desenvolvimento. Descobrir ferramentas por necessidade real, sem instalar um catálogo completo ou prometer auditorias que não ocorreram.

## 12. Prompt específico para a próxima etapa

> Desenvolva o Conecta SINTEDORP, uma plataforma gratuita de intermediação de vagas para trabalhadores domésticos em Ribeirão Preto e região, administrada pelo sindicato. Use os documentos de extensão como fonte de requisitos e identifique conflitos e hipóteses.
>
> Primeiro inspecione o repositório e preserve qualquer trabalho existente. Defina o nível de entrega: protótipo demonstrável, MVP funcional ou produção. Para o MVP, implemente cadastro/acesso, perfil de trabalhador, empregador PF/PJ, vagas com aceite versionado das regras, análise sindical antes da publicação, busca com filtros e candidaturas. Planeje e implemente em etapas explícitas o contato, histórico, avaliações e relatórios solicitados. Reserve cursos e certificados para uma fase posterior, salvo mudança expressa de prioridade.
>
> Use permissões verificadas no servidor: trabalhador acessa seus dados; empregador acessa suas vagas e candidaturas associadas; equipe sindical recebe acesso administrativo por convite. Nunca permita autocadastro privilegiado. Não publique CPF, endereço residencial completo, contato privado ou histórico individual.
>
> Defina a stack com base nas competências da equipe e hospedagem. Prefira uma aplicação única e banco relacional. Persistência, autenticação e autorização devem funcionar de verdade para considerar o MVP funcional. Não apresente armazenamento local ou dados simulados como produção.
>
> Projete primeiro para celular, em português, com HTML semântico, navegação por teclado, formulários rotulados, foco visível, mensagens claras e objetivo WCAG 2.2 AA. Não invente estatísticas, identidade oficial, depoimentos ou selos. Inclua estados de carregamento, vazio, erro e sucesso.
>
> Diferencie validação de CPF/CNPJ, consulta cadastral e comprovação de identidade. Não consulte dados reais nem contrate APIs sem fonte, acesso e finalidade definidos. Use dados fictícios em testes. Consulte documentação oficial atual antes de uma integração, mantenha credenciais no servidor e trate indisponibilidade sem indicar falsamente que o documento foi verificado.
>
> Modele vagas, candidaturas, experiências e avaliações com estados e regras explícitas. A publicação de avaliações e a verificação de experiências dependem de política do sindicato. Piso salarial e regras trabalhistas devem ter fonte, vigência e manutenção definidas; não invente valores ou prometa garantia jurídica absoluta.
>
> Verifique os fluxos de cadastro → envio de vaga → aprovação → busca → candidatura; teste acesso indevido entre contas, alterações após aprovação, duplicidades e falhas de serviços externos. Quando módulos de histórico, avaliação e relatório estiverem implementados, teste suas regras e consistência. Execute build e verificações relevantes, inspecione a interface em celular e registre resultados efetivos.
>
> Entregue código compreensível, instruções de instalação/execução, requisitos de configuração sem segredos, modelo de dados, evidências dos testes e limitações conhecidas. Publicação e integrações reais devem ter seu estado informado separadamente. Não declare uma capacidade pronta sem evidência.

## 13. Decisões para validar com sindicato e orientador

1. A entrega acadêmica exigida é protótipo ou MVP hospedado? Qual prazo e disponibilidade efetiva da equipe?
2. Quais empregadores PF/PJ e categorias de vagas podem usar a plataforma?
3. Quais regras, fontes e vigências definem a aprovação de remuneração, jornada e benefícios?
4. O contato será interno, mediado pelo sindicato ou por compartilhamento autorizado de telefone?
5. Como se confirma a experiência e quem pode visualizar/publicar avaliações e responder a elas?
6. Quem responde pelos dados, quais prazos de retenção se aplicam e existe orçamento/acesso autorizado para APIs?
7. Qual stack a equipe domina, qual hospedagem será utilizada e quais materiais oficiais de marca podem ser usados?

Essas decisões não impedem prototipagem com dados fictícios e modelagem inicial. Impedem tratar políticas propostas, consultas reais ou requisitos jurídicos como aprovados.

## 14. Próxima sequência de trabalho

1. Validar o escopo acadêmico e as regras do sindicato.
2. Criar protótipo dos fluxos centrais e validar com representantes dos três perfis.
3. Fechar modelo de dados, autorização e stack.
4. Implementar cadastro, vagas, moderação e candidatura.
5. Implementar contato, histórico, avaliações e relatórios conforme prioridades formalizadas.
6. Testar, documentar e preparar hospedagem; manter relatório acadêmico e banner como entregas próprias.

Esta análise não certifica a situação atual do repositório remoto. Na inspeção anterior desta conversa, o checkout estava sem commits e o remoto não apresentou a branch main; nenhuma nova inspeção remota foi necessária para esta análise dos anexos.
