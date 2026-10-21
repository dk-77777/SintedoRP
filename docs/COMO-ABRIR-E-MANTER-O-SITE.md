# Como abrir e manter o Conecta SINTEDORP

## O que aconteceu no computador

O site tem uma parte que mostra as páginas e outra que guarda os dados de contas, vagas e mensagens. O PostgreSQL é o programa que guarda esses dados. Neste computador ele roda dentro do Docker.

Os dois containers do projeto estavam parados. Depois de iniciá-los, foi identificado outro problema: a senha de conexão salva nesta cópia do projeto era diferente da configurada no banco existente. A conexão foi ajustada, com backup dos arquivos privados, sem apagar registros. Não foi possível determinar quando a senha desta cópia ficou diferente.

Durante uma nova verificação, o motor do Docker também deixou de responder. Reabrir o Docker e iniciar os containers restaurou o banco. Fechar ou desligar o ambiente local interrompe os serviços que dependem dele.

O Supabase mostrado no painel é outro banco, na internet. Ele estava pausado. A cópia local está configurada para usar o Docker, portanto retomar o Supabase não corrige a conexão local automaticamente.

## Para abrir novamente neste computador

1. Abra o Docker Desktop e aguarde aparecer **Engine running**.
2. Em **Containers**, inicie pelo botão de play `conecta-sintedorp-db` e `conecta-sintedorp-mail`. Confira se ambos aparecem em execução.
3. Abra `http://localhost:3000`. Se o servidor do site não estiver iniciado, abra um terminal na pasta do projeto e execute `npm.cmd run dev`. Deixe esse terminal aberto enquanto estiver usando o site.
4. Abra `http://localhost:3000/api/health`. Quando aparecer `{"status":"ready"}`, o site consegue acessar o banco e suas migrações estão presentes.
5. Atualize a página do site. Se ainda aparecer erro, confira a configuração de conexão e os logs antes de trocar senhas ou reinstalar serviços.

Se for necessário reiniciar um servidor iniciado no terminal, use **Ctrl+C** nesse terminal e execute `npm.cmd run dev` novamente. Alterações na conexão podem exigir esse reinício.

Não exclua o container ou o armazenamento do banco para corrigir uma falha de conexão. Preserve `.env.local` e `.local/`: são arquivos privados com configurações e segredos. Os backups desta correção ficam em `.local/connection-repair/` e também devem permanecer privados.

## Entrega ao sindicato

`localhost` é o endereço do ambiente no próprio computador. Para atender o público, a aplicação e o banco precisam ser publicados e configurados em uma hospedagem. Na implantação adequada, o site funciona independentemente de este computador estar ligado.

O site pode operar por muitos anos, mas depende de continuidade dos serviços e de manutenção. A entrega deve definir:

- Quem controla as contas de hospedagem, banco, domínio e e-mail, preferencialmente sob responsabilidade do sindicato.
- Quem paga os serviços e renova o domínio.
- Quem recebe alertas de falhas e assume o suporte.
- Como são feitos os backups e como será testada a restauração dos dados.
- Quem mantém o sistema atualizado e testa login, recuperação de senha, publicação de vagas e demais fluxos no endereço oficial.
- Qual será o procedimento se um provedor ficar indisponível ou se for preciso migrar o site.

A versão oficial deve usar um ambiente de produção separado dos testes, com configurações e e-mail próprios. O Mailpit do Docker é uma caixa de testes; ele não entrega os e-mails reais aos usuários do sindicato.

## Planos gratuitos e pausas

Consulta às fontes oficiais em 21/10/2026:

- O Supabase informa que projetos gratuitos com pouca atividade podem ser pausados após um período de sete dias. No painel, **Resume project** retoma um projeto pausado dentro do prazo permitido. Planos pagos não estão sujeitos à pausa automática por inatividade. Isso não representa uma garantia de disponibilidade permanente: [Project Pausing](https://supabase.com/docs/guides/platform/free-project-pausing).
- O plano Hobby da Vercel é restrito a uso pessoal e não comercial. A operação institucional deve usar uma hospedagem/plano compatível com o uso: [Vercel Hobby](https://vercel.com/docs/plans/hobby).

Os limites e preços devem ser conferidos no momento da contratação. Publicar o código uma vez não elimina os custos e responsabilidades de operação. O ambiente publicado no Supabase e uma eventual hospedagem do site não foram auditados nesta correção local.
