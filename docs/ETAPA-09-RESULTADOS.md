# Etapa 9 — Preparação operacional da implantação

Em 7 de outubro de 2026, o usuário confirmou que ainda não criou os projetos Vercel/Supabase. Foram concluídas as ferramentas locais de preparação e verificação, sem tentar publicar o site ou criar contas externas.

## Entrega

- `npm run deploy:prepare`: cria modelos `.local/production.env` e `.local/migration.env`, sem valores secretos, com permissão 600. Execuções seguintes preservam os arquivos existentes. Os modelos não são carregados automaticamente pelo Next.js e ficam fora do Git/Docker.
- `npm run deploy:check`: valida somente variáveis explicitamente injetadas, com relatório de nomes e mensagens fixas. Não lê `.env.local`, não imprime valores e não tenta rede no modo padrão. Configuração incompleta retorna código 1 antes de qualquer conexão.
- `npm run deploy:check -- --connect`: após a validação estática, confere conexão e checksums das migrações PostgreSQL por leitura, além de conexão/autenticação SMTP sem envio de mensagem. Não aplica schema, promove contas ou publica o site.
- [.env.production.example](../.env.production.example): modelo público sem credenciais, com demo desativada e limite inicial de duas conexões por instância.
- [CRIAR-CONTAS-E-PUBLICAR.md](CRIAR-CONTAS-E-PUBLICAR.md): roteiro para abrir os projetos, autorizar remetente, injetar variáveis, migrar por conexão de sessão e conferir a implantação.

A validação exige origem HTTPS, documento-chave com formato correto, segredo de autenticação com comprimento/diversidade mínima, conexão PostgreSQL com `sslmode=verify-full` e SMTP autenticado com TLS direto ou STARTTLS obrigatório. Ela rejeita valores locais, opções duplicadas ou overrides que contornem esses requisitos, modos de demonstração e desativação global da validação TLS. Esses checks de formato não comprovam a geração aleatória ou exclusividade dos segredos.

Política institucional, autorização do remetente/domínio, bloqueio da Data API no Supabase e condições dos planos seguem como verificações externas explícitas. A checagem SMTP não comprova recebimento do e-mail. Código 0 sem `--connect` comprova somente configuração estática.

## Evidências executadas

| Verificação                | Resultado                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Instalação reproduzível    | `scripts/cloud-install.sh` concluído com npm ci, serviços reutilizados, migrações, build, tipos e testes                     |
| Build e TypeScript         | Passaram após a inclusão das ferramentas e testes                                                                            |
| Testes de servidor         | 11 passaram, nenhum ignorado; incluem seis cenários novos de configuração, CLI e SMTP                                        |
| Integração das ferramentas | Dois testes passaram em 2,7 s, usando PostgreSQL temporário e Mailpit local                                                  |
| Integridade SQL            | A conferência aceitou as migrações aplicadas, recusou uma cópia alterada e reconfirmou o banco original sem aplicar mudanças |
| TLS SMTP obrigatório       | Servidor simulado que recusou STARTTLS não recebeu AUTH nem MAIL                                                             |
| SMTP sem envio             | Conexão local verificada; total numérico de mensagens da caixa permaneceu igual                                              |
| Relatório sem segredos     | CLI testada com valores fictícios válidos/inválidos; URLs, senhas, chave e segredo não apareceram no relatório               |
| Preparação repetida        | Modelos existentes mantidos byte a byte; arquivos novos com permissão 600 e ignorados pelo Git                               |
| Configuração externa vazia | Checker recusou os modelos vazios antes de tentar conexões, como esperado                                                    |
| Git remoto                 | Leitura autorizada de refs concluída sem retornar branches; ainda não há commit/push dos arquivos locais                     |

São **13 testes executados nesta rodada**. Os seis cenários funcionais da aplicação e os 15 testes do protótipo, documentados nas etapas anteriores, não foram repetidos porque esta etapa acrescentou ferramentas administrativas e documentação. O build e a checagem de tipos continuam cobrindo o projeto completo.

## Estado final e próximo passo

As configurações disponíveis de banco/origem/SMTP são locais. Tokens Vercel/Supabase não estão presentes. Os projetos e o remetente externo ainda precisam ser criados/configurados pelo titular das contas; valores devem ser inseridos nos painéis seguros. Não houve implantação ou verificação nos provedores externos, nem confirmação de suas cotas atuais.

O `start_skill` foi atualizado com os novos comandos e o estado informado pelo usuário. O `install_script` continua sendo o script completo executado nesta rodada. Salvar o rascunho não publica o ambiente ou o site; a configuração/snapshot do ambiente é revisada, salva e publicada pelo produto.

Modelo recomendado para implementação/implantação: GPT-6.1 Sol. Para revisão complementar das permissões/políticas: GPT-6 Astra. Não foi afirmada troca automática de modelo.
