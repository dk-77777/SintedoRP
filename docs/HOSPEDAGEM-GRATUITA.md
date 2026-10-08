# Hospedagem para apresentação acadêmica

Recomendação: **Vercel Hobby para o Next.js + Supabase Free para o PostgreSQL**, com um provedor SMTP que ofereça plano gratuito. O projeto usa Better Auth no próprio servidor; não usa Supabase Auth nem exige uma chave pública do Supabase no navegador.

O Hobby da Vercel é destinado a uso pessoal e não comercial. A apresentação acadêmica deve respeitar essa condição; antes de uma operação oficial do sindicato, confira elegibilidade ou escolha um plano/hospedagem compatível. Planos gratuitos têm cotas e podem ter restrições de disponibilidade, recursos e inatividade. Não há garantia de custo zero se ultrapassar limites ou ativar recursos pagos. O subdomínio fornecido pela hospedagem permite começar sem comprar domínio; um domínio institucional e seu serviço de e-mail podem ter custo.

As páginas oficiais retornaram HTTP 403 na rede deste ambiente em 7/10/2026, por isso não foram confirmadas cotas/preços atuais. Confira [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Supabase Pricing](https://supabase.com/pricing) e as condições do provedor de e-mail. Este roteiro foi preparado a partir da arquitetura; a implantação nesses serviços ainda não foi executada.

## PostgreSQL

1. Crie um projeto Supabase exclusivo para o trabalho, próximo à região da aplicação. Use apenas dados de teste enquanto as definições institucionais estiverem pendentes.
2. O banco é acessado exclusivamente pelo backend. Desative a Data API desse projeto e não exponha as tabelas da aplicação pelos papéis `anon` e `authenticated`. Não configure acesso direto pelo navegador nem use uma chave `service_role` no cliente. Revise as permissões novamente após migrações futuras.
3. Obtenha a conexão PostgreSQL pelo painel. Para as funções do site, escolha o pooler compatível com serverless; o aplicativo não usa prepared statements nomeados. Para migração, use conexão direta ou pooler em **modo de sessão**, porque o runner mantém uma trava consultiva na mesma conexão. Não use pooler em modo de transação para o runner.
4. Exija TLS com validação de certificado e hostname (por exemplo, `sslmode=verify-full`). Se o provedor exigir sua CA, forneça o certificado oficial pela configuração suportada do driver, em caminho disponível no processo. Não use `rejectUnauthorized: false`, `NODE_TLS_REJECT_UNAUTHORIZED=0` ou parâmetros que eliminem a validação.
5. Em um checkout com Node.js 24 e dependências instaladas, injete a conexão de migração no ambiente e execute `npm run db:migrate`. O script aplica as quatro migrações e verifica checksums. Nunca execute `npm run services` contra produção.

Como o SQL da aplicação não implementa políticas RLS para acesso pelo Supabase REST, o bloqueio da Data API e das permissões públicas é parte necessária desta implantação. Em um projeto dedicado, o operador pode executar, com o proprietário das tabelas, antes de abrir o site:

```sql
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
```

Os default privileges valem para objetos criados pelo papel que executa o comando; mantenha o mesmo proprietário nas migrações seguintes ou configure o papel correspondente. Confirme o bloqueio por uma consulta REST anônima e com usuário Supabase comum, sem ler/imprimir dados reais. Se o projeto também tiver outros aplicativos usando `public`, planeje schemas separados antes de executar revogações gerais.

## Vercel

1. Disponibilize a versão revisada do código no GitHub e importe o repositório. O checkout atual ainda não tem commit/push. A preparação local não envia arquivos automaticamente.
2. Escolha Next.js, raiz do projeto, Node.js 24, instalação `npm ci` e build `npm run build`. Na Vercel, mantenha a saída padrão detectada pelo framework; o comando standalone/Docker é a alternativa para outras hospedagens.
3. Cadastre as variáveis na configuração segura do projeto, conforme [PUBLICACAO.md](PUBLICACAO.md). Use a conexão runtime do banco em `DATABASE_URL`, `DATABASE_POOL_MAX=2`, uma origem HTTPS estável em `BETTER_AUTH_URL`, novos `BETTER_AUTH_SECRET` e `DOCUMENT_KEY`, `ENABLE_DEMO=false`, `SMTP_URL` e `MAIL_FROM` próprios. Não use prefixo `NEXT_PUBLIC_` para segredos. O limite de conexões é **por instância**; a concorrência total ainda precisa ser acompanhada.
4. Configure e teste o cabeçalho de IP efetivamente substituído pela plataforma antes de preencher `TRUSTED_IP_HEADER`. Consulte a documentação atual do proxy; não confie num cabeçalho enviado livremente pelo visitante. A configuração padrão mantém um limite compartilhado, com impacto para vários usuários.
5. Não aponte deploys de preview para o banco institucional. Use ambiente de teste separado e origem própria ou mantenha as APIs de preview sem credenciais. Links de confirmação e cookies exigem que a origem utilizada coincida com `BETTER_AUTH_URL`.

## E-mail e primeiro acesso

Escolha um provedor SMTP com condições gratuitas adequadas, como Brevo, ou outro compatível com Nodemailer. Confirme limites, domínio/remetente autorizado e entrega antes de depender do cadastro. Não use Mailpit na hospedagem externa: ele é somente a caixa local dos testes. Se o provedor só permitir envio a destinatários de teste, mantenha esse limite explícito na apresentação.

Após implantar, confirme `/api/health`, cadastro, recebimento de e-mail, verificação, login e recuperação no domínio final. Provisione a primeira conta sindical já verificada por `npm run admin:grant`, com a conexão externa injetada somente no processo administrativo. Teste vagas, candidaturas, mensagens, confirmação/encerramento de experiência e relatório com contas de teste separadas. Faça exportação e restauração de backup antes de armazenar dados institucionais.

Contas nos provedores, credenciais, remetente e origem HTTPS ainda não foram fornecidos. Os valores devem ser inseridos nos gerenciadores de segredos dos serviços; nunca enviados no chat ou copiados para o Git. GPT-6.1 Sol é a recomendação para executar a implantação; GPT-6 Astra para uma revisão complementar das permissões e políticas, sem presumir troca automática de modelo.

Como os projetos ainda não foram criados, siga [CRIAR-CONTAS-E-PUBLICAR.md](CRIAR-CONTAS-E-PUBLICAR.md). A etapa 9 acrescenta modelos privados preservados e checagem estática/conectividade: banco e checksums por leitura; SMTP por conexão/autenticação, sem envio de mensagem. As ferramentas não criam contas ou publicam automaticamente.
