# Disponibilidade e hospedagem do Conecta SINTEDORP

Relatório para análise da equipe e preparação da entrega ao sindicato

Data de referência: 21 de outubro de 2026. Versão 1.0. Elaborado a partir dos registros da intervenção local, do código do projeto e das fontes oficiais relacionadas ao final. Documento de apoio à decisão; não representa contratação, publicação ou autorização dos provedores.

## 1 Síntese para a reunião

O problema observado foi a indisponibilidade do banco local, agravada por uma senha de conexão diferente da configurada no banco existente. A configuração foi corrigida, os containers existentes foram iniciados e o servidor foi reiniciado. Os registros de validação confirmaram a recuperação da API real e o carregamento das páginas principais, sem apagar dados.

O Supabase mostrado no painel estava pausado. Ele é um ambiente separado: a cópia local acessa PostgreSQL no Docker, e não o Supabase. A pausa remota não explica o erro de senha local. A versão publicada ainda precisa ser auditada no endereço oficial.

**Recomendação para a equipe:** manter o Supabase existente enquanto se confirma a elegibilidade do uso no Vercel Hobby e se mede o consumo. Evitar uma migração de banco apenas por causa de uma falha do Docker. Se o Hobby não for permitido e o orçamento for zero, avaliar Netlify Free com o próprio Supabase antes de considerar uma mudança para Neon. Para operação institucional com menor tolerância a interrupções, prever orçamento de hospedagem, banco e manutenção.

### O que precisa ser decidido

1. O lançamento será uma demonstração acadêmica ou a operação oficial do sindicato?
2. O desenvolvimento e a manutenção serão remunerados? Haverá cobranças ou anúncios no portal?
3. A equipe aceita pausas e limites de planos gratuitos? Quem responderá quando houver uma interrupção?
4. Quem será proprietário das contas, responsável pelos backups e autorizado a pagar por expansão?

### Como as partes se relacionam

| Parte | Função | Situação verificada |
| --- | --- | --- |
| Aplicação Next.js | Mostra páginas, recebe ações e controla o acesso | Rodou no computador em localhost:3000 |
| PostgreSQL local | Guarda contas, vagas e mensagens | Existente no container do Docker |
| Supabase | Oferece PostgreSQL hospedado na internet | Painel do usuário mostrava projeto pausado |
| E-mail local Mailpit | Captura mensagens de teste | Container local; não entrega e-mails ao público |

Uma hospedagem de produção adequada permite que o site funcione com o computador do desenvolvedor desligado. A publicação depende de aplicação, banco, e-mail e configurações corretas no ambiente externo.

## 2 Diagnóstico e procedimento de recuperação

### O que foi confirmado

- Os containers `conecta-sintedorp-db` e `conecta-sintedorp-mail` estavam parados.
- O acesso ao banco em 127.0.0.1:5432 era recusado. A API de estado retornava HTTP 500 e a verificação de saúde retornava HTTP 503.
- Após iniciar os containers, o banco respondeu, mas rejeitou a senha desta cópia, com código PostgreSQL 28P01.
- A conexão usando a credencial do container existente funcionou. As quatro migrações já estavam aplicadas.
- Foram alinhadas as configurações locais de conexão, com backup privado em `.local/connection-repair/`. As chaves da aplicação foram preservadas.
- O servidor Next.js desta cópia foi reiniciado para liberar a conexão antiga em memória. Não foi necessário recriar o banco.

### Por que isso pode acontecer

O Docker é o ambiente que mantém o banco local em execução. Quando seu motor ou os containers ficam parados, o site perde esse acesso. Durante a conferência, o motor ficou indisponível novamente; reabri-lo e iniciar os containers restaurou a API. A causa exata dessa parada não foi determinada.

A senha salva no projeto também pode ficar diferente da configuração de um banco já existente. Essa diferença foi comprovada, mas não há evidência suficiente para atribuí-la a uma cópia de pasta, troca de senha ou outra ação específica.

### Como tentar resolver neste computador

1. Abrir o Docker Desktop e aguardar **Engine running**.
2. Em Containers, iniciar `conecta-sintedorp-db` e `conecta-sintedorp-mail` pelo botão de play.
3. Abrir http://localhost:3000. Se o servidor não estiver iniciado, executar `npm.cmd run dev` na pasta do projeto e manter o terminal aberto.
4. Consultar http://localhost:3000/api/health. O retorno esperado é `{"status":"ready"}`.
5. Atualizar o navegador. Se persistir o erro, conferir a conexão e os logs com o responsável técnico.

Para reiniciar um servidor iniciado no terminal, usar Ctrl+C e executar novamente `npm.cmd run dev`. Não iniciar várias cópias sem conferir as portas. Não apagar containers, armazenamento ou arquivos privados para tentar corrigir uma conexão.

### O que a validação realmente demonstra

Os registros confirmaram HTTP 200 em `/api/health`, `/api/state` e na consulta de sessão anônima. Home, login, cadastro e vagas carregaram com a API real. O SMTP local respondeu sem envio de e-mail. Isso não equivale a testar uma conta real de ponta a ponta, a entrega de e-mail externo ou o site publicado. São resultados da sessão de verificação, não monitoramento contínuo.

## 3 Opções para hospedagem

As alternativas abaixo usam o mesmo tipo de banco PostgreSQL. O projeto já utiliza Better Auth no próprio servidor; trocar o provedor do banco não exige adotar Supabase Auth ou o serviço de autenticação do Neon.

| Opção | Combinação | Base mensal indicativa | Principal condição |
| --- | --- | --- | --- |
| A | Vercel Hobby e Supabase Free | US$ 0 dentro das cotas | Confirmar elegibilidade no Hobby; Supabase pode pausar por pouca atividade |
| B | Netlify Free e Supabase Free | US$ 0 dentro das cotas | Netlify pode pausar por consumo; Supabase mantém a condição de atividade |
| C | Netlify Free e Neon Free | US$ 0 dentro das cotas | Medir consumo e planejar eventual migração de dados |
| D | Vercel Pro e Supabase Pro | A partir de cerca de US$ 45 | Referência para uma configuração básica com um desenvolvedor e um projeto |

E-mail é uma necessidade adicional em todas as opções. Brevo Free é uma possibilidade para começar, sujeito à aprovação/configuração da conta e do remetente. Domínio próprio, câmbio, impostos, consumo excedente, usuários adicionais, suporte e manutenção não estão incluídos nos valores acima. Preços em dólares, consultados em 21/10/2026. Fontes: [1] a [9].

### A Aproveitar Vercel e Supabase

É uma combinação tecnicamente adequada ao Next.js e aproveita o projeto Supabase já conhecido pela equipe. O obstáculo à escolha gratuita é a regra de uso do Hobby, além dos limites dos dois serviços. A configuração remota e os dados existentes ainda precisam ser conferidos. Não foi demonstrada necessidade técnica de mudar de banco.

### B Manter o Supabase e trocar a hospedagem

A Netlify permite projetos comerciais no plano gratuito e oferece suporte a Next.js. Essa opção evita migrar o banco. Ainda exige teste de compatibilidade do projeto no ambiente externo e mantém a possibilidade de pausa do Supabase Free. É a primeira alternativa a avaliar se o Hobby não for elegível e o orçamento continuar zero. Fontes: [4] e [5].

### C Usar Neon como banco

O Neon reduz o processamento quando o banco fica ocioso e pode retomá-lo automaticamente ao receber acesso. Pode ser útil para uso intermitente. A troca exige inventário, cópia e validação dos dados e migrações antes de mudar a conexão. Não se deve sobrescrever ou descartar o Supabase existente. Fonte: [7].

### D Reservar orçamento para operação

As referências consultadas anunciam Vercel Pro por US$ 20 mensais e Supabase Pro a partir de US$ 25 mensais. O total inicial de US$ 45 é uma referência, não uma proposta fechada. A cobrança deve ser simulada com o número de desenvolvedores, projetos e recursos reais. Planos pagos reduzem algumas restrições, mas não garantem disponibilidade infinita. Fontes: [3] e [8].

## 4 Regras e limites que afetam a decisão

### Elegibilidade no Vercel Hobby

A Vercel restringe o Hobby ao uso pessoal e não comercial. Sua definição de uso comercial inclui receber pagamento para criar, atualizar ou hospedar o site, processar pagamentos de visitantes, anunciar produtos ou serviços à venda e exibir publicidade. Pedir doações, isoladamente, não é classificado como uso comercial nessa regra. Fonte: [1].

Ser sindicato ou não ter fins lucrativos não confirma automaticamente a elegibilidade. Também não se deve presumir que o acesso gratuito dos visitantes resolve a questão. A classificação do portal institucional deve ser confirmada com a Vercel, descrevendo remuneração, serviços, cobranças e finalidade reais. A própria documentação orienta consultar o suporte quando houver dúvida.

### Limites gratuitos relevantes

| Serviço | Condição consultada | Consequência prática |
| --- | --- | --- |
| Supabase Free | Banco de 500 MB; pouca atividade por sete dias pode levar à pausa | É necessário acompanhar o projeto e retomar pelo painel quando aplicável |
| Netlify Free | 300 créditos mensais; projetos podem pausar ao esgotar a cota | Publicações, tráfego e execução precisam ser monitorados |
| Neon Free | 1 GB de banco e 100 CU-horas mensais por projeto | O consumo depende de quanto tempo e com que capacidade o banco fica ativo |
| Brevo Free | 300 envios de e-mail por dia; franquia diária não acumula | Cadastro e recuperação de senha precisam respeitar a capacidade de envio |

Fontes: [2], [5], [6], [7] e [9]. Contas antigas podem ter regras legadas; conferir o plano efetivo no painel antes da decisão. Em novos projetos gratuitos, a Netlify também informa um badge de identificação ativado por padrão; revisar a configuração e o efeito visual na implantação. Fonte: [10].

### Um detalhe do código que merece medição

O cliente consulta `/api/state` a cada 30 segundos enquanto a aba está visível. Uma aba aberta oito horas por dia, por 30 dias, pode gerar cerca de **28.800 consultas automáticas mensais**, além da consulta inicial e das ações do usuário. Dez abas nas mesmas condições gerariam aproximadamente 288.000. É um cenário ilustrativo, não uma previsão de audiência.

Esse comportamento pode manter o banco ativo e consumir a franquia gratuita mesmo com poucas pessoas. Antes de escolher o plano, medir latência, tráfego, consultas e tempo de processamento; avaliar uma atualização menos frequente nas páginas públicas. Não foi realizada uma mudança de polling nesta tarefa. Créditos da Netlify, requisições e CU-horas do Neon são medidas diferentes e não devem ser comparadas como se fossem a mesma unidade.

## 5 Preparação para entrega e continuidade

O site pode operar por muitos anos se houver continuidade dos serviços e manutenção. A entrega deve incluir os meios de sustentar e recuperar a operação, além do código e das telas.

| Responsabilidade | Responsável a definir | Entrega esperada |
| --- | --- | --- |
| Contas e pagamentos | Representante do sindicato | Controle de hospedagem, banco, domínio, e-mail e recuperação de acesso |
| Implantação e atualizações | Equipe técnica | Processo de publicação, versão recuperável e testes após alterações |
| Monitoramento e incidentes | Responsável técnico com substituto | Alertas, contato e procedimento para indisponibilidade |
| Backups e restauração | Responsável técnico e sindicato | Cópias protegidas, periodicidade e teste de restauração |
| Conteúdo e moderação | Equipe do sindicato | Aprovação de vagas, atendimento e manutenção das informações |

### Antes de abrir ao público

1. Confirmar a opção de hospedagem e a permissão do plano; registrar a resposta da Vercel se o Hobby for considerado.
2. Inventariar os dados existentes, fazer backup e separar produção de testes. Manter as chaves necessárias para ler os dados já cifrados; uma migração não pode gerar chaves novas sem planejamento.
3. Configurar HTTPS, banco, origem de autenticação e segredos no provedor. Conferir conexões e migrações. Nenhum segredo deve ir ao repositório, relatório ou navegador.
4. Configurar e-mail externo com remetente autorizado. Mailpit é uma caixa de teste local e não atende os usuários reais do sindicato.
5. Testar cadastro, recebimento de e-mail, confirmação, login, recuperação, publicação e aprovação de vaga, candidatura, mensagens e permissões no endereço final.
6. Revisar demonstração, dados de teste, textos institucionais e privacidade. O código consultado mantém `robots` com indexação e seguimento desativados; decidir conscientemente quando liberar a indexação. O projeto prevê `ENABLE_DEMO=false` na publicação externa.
7. Testar backup e restauração, definir alertas de consumo e documentar quem atende um incidente.

Se o Supabase for utilizado, conferir a exposição dos dados e as permissões das tabelas. A aplicação usa o backend para autorização; não se deve presumir que habilitar APIs públicas do banco reproduz essas permissões. A revisão técnica de implantação e as definições de privacidade do sindicato ainda precisam ser concluídas.

### Estado atual da Home

A seção sem vagas agora explica a ausência de oportunidades e reúne “Criar meu perfil” à mensagem. TypeScript, build e 26 testes visuais passaram; a seção foi conferida com API real. O desaparecimento de textos da captura não foi reproduzido.

## 6 Pauta de decisão e consulta à Vercel

### Decisões propostas para a reunião

| Questão | Registro da equipe |
| --- | --- |
| Finalidade do primeiro lançamento | Definir demonstração acadêmica ou operação institucional |
| Remuneração e cobranças | Informar desenvolvimento, manutenção, anúncios e pagamentos no portal |
| Orçamento | Definir teto mensal e quem pode autorizar expansão |
| Hospedagem escolhida | Selecionar A, B, C ou D após conferir as condições |
| Dados existentes | Identificar o banco de referência e o que deve ser preservado |
| Operação | Nomear responsável, substituto e contato de suporte |
| Continuidade | Definir periodicidade de backup e prazo de recuperação desejado |
| Critério para lançamento | Aprovar testes externos e aceite do sindicato |

### Texto sugerido para a Vercel

Olá. Estamos preparando o Conecta SINTEDORP para um sindicato brasileiro. O portal terá cadastro de trabalhadores e empregadores, publicação de vagas e atendimento sindical. Pretendemos usar Vercel e PostgreSQL no Supabase.

Informaremos nesta solicitação se o desenvolvimento e a manutenção são acadêmicos, voluntários ou remunerados; se o acesso é gratuito ou pago; e se haverá publicidade, processamento de pagamentos, mensalidades ou outros serviços oferecidos pelo portal.

Podem confirmar se a utilização institucional descrita é permitida no plano Hobby? Se exigir outro plano, existe algum programa aplicável a projetos acadêmicos ou entidades sem fins lucrativos? Gostaríamos de registrar a orientação para a entrega ao sindicato.

Enviar pelo canal oficial https://vercel.com/help, completar as informações reais e guardar a resposta. A mensagem acima não foi enviada e não representa uma autorização da Vercel. Fonte: [1].

### Sequência recomendada

Primeiro, validar a elegibilidade e inspecionar o Supabase existente. Depois, escolher a opção e preparar um ambiente de teste externo separado. Em seguida, medir consumo e executar os fluxos completos. Por fim, fazer o aceite com o sindicato, registrar contas e responsáveis e só então planejar a abertura oficial.

Não foi contratado um plano, migrado um banco ou publicada uma nova versão durante a elaboração deste relatório.

## 7 Fontes e limites do relatório

Fontes oficiais consultadas em 21 de outubro de 2026. Condições e preços podem mudar. As referências não substituem a confirmação de enquadramento do caso concreto pelo provedor.

1. **Vercel Fair Use Guidelines**. Uso comercial e orientação para consulta ao suporte. https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage
2. **Supabase Project Pausing**. Baixa atividade, retomada e planos pagos. https://supabase.com/docs/guides/platform/free-project-pausing
3. **Vercel Pricing**. Preços e cobrança do Pro. https://vercel.com/pricing
4. **Netlify Next.js e uso comercial**. Compatibilidade e permissão indicada pelo provedor. https://www.netlify.com/guides/netlify-vs-vercel/ e https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
5. **Netlify Credit-based pricing plans**. Franquias e modalidade gratuita. https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/
6. **Netlify Billing FAQ**. Pausa dos projetos ao exceder limites gratuitos. https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/
7. **Neon Pricing**. Franquia Free, armazenamento e processamento sob demanda. https://neon.com/pricing
8. **Supabase Pricing**. Free, Pro e backups anunciados. https://supabase.com/pricing
9. **Brevo Free plan limits**. Envio diário e condições do plano. https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan
10. **Netlify Powered by Netlify badge**. Comportamento de novos projetos. https://www.netlify.com/changelog/2026-08-19-pre-launch-toolbar-and-powered-by-netlify-badge/

### Evidências locais utilizadas

- Registros locais de recuperação da conexão e do estado sem vagas: arquivados em `.local/cleanup-2026-10-21/artifacts/{local-connection,home-empty}/`, fora do Git. O diagnóstico e o procedimento de recuperação estão no guia de operação local.
- `src/live/provider.tsx`: atualização automática enquanto a aba está visível.
- `src/app/layout.tsx`: configuração de indexação consultada.
- `src/server/deployment.ts`, `docs/PUBLICACAO.md` e `docs/HOSPEDAGEM-GRATUITA.md`: requisitos de implantação previstos no projeto.
- `docs/COMO-ABRIR-E-MANTER-O-SITE.md`: procedimento local para a equipe.

### O que permanece em aberto

Não foram auditados a hospedagem publicada, o conteúdo do banco remoto, a elegibilidade do sindicato, a entrega externa de e-mails, o volume real de uso ou a restauração de um backup de produção. Os testes visuais com fixtures verificam interface e navegação; não comprovam integração de produção. As verificações reais locais confirmam apenas os fluxos e respostas explicitamente registrados.

### Vocabulário básico

**Hospedagem:** serviço que executa o site na internet. **Banco de dados:** guarda os registros. **Docker:** ambiente que executa os serviços locais. **Localhost:** endereço no próprio computador. **Migração:** mudança versionada na estrutura do banco. **Backup:** cópia recuperável dos dados. **SMTP:** conexão usada para enviar e-mail. **Cota:** limite de uso incluído no plano.
