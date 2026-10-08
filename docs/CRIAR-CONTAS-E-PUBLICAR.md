# Criar os projetos e publicar a apresentação acadêmica

O usuário informou que ainda não criou os projetos externos. O ambiente local funciona, mas não foi publicado na Vercel ou no Supabase. O roteiro abaixo prepara essa implantação. Confirme as condições e cotas atuais dos planos em [HOSPEDAGEM-GRATUITA.md](HOSPEDAGEM-GRATUITA.md); Vercel Hobby é destinado a uso pessoal/não comercial.

## 1. Supabase: criar o banco

Abra [Supabase](https://supabase.com/), entre com sua conta e crie um projeto exclusivo para **Conecta SINTEDORP**. Escolha a região mais próxima da hospedagem e guarde a senha do banco num gerenciador de senhas. Não envie a senha neste chat.

O aplicativo usa PostgreSQL diretamente pelo backend, com Better Auth. Não precisa cadastrar usuários no Supabase Auth nem colocar uma chave Supabase no navegador. Desative a Data API do projeto e aplique as restrições para `anon`/`authenticated` descritas em [HOSPEDAGEM-GRATUITA.md](HOSPEDAGEM-GRATUITA.md), pois as tabelas de contas e conversas não são públicas.

Separe duas conexões obtidas no painel: a conexão de runtime adequada para serverless e a conexão direta ou por pooler em modo de sessão, utilizada nas migrações. O runner usa uma trava de sessão; não o execute pelo pooler de transação. Configure TLS com validação de certificado e hostname, conforme o provedor; o checker exige `sslmode=verify-full`.

## 2. Vercel: criar o projeto Next.js

Abra [Vercel](https://vercel.com/), entre com a conta que tem acesso ao repositório e importe `dk-77777/SintedoRP` quando os arquivos desta versão estiverem disponíveis no GitHub. O checkout atual contém arquivos locais ainda sem commit/push; o remoto consultado não retornou branches. Os arquivos locais não aparecem automaticamente ao importar o repositório.

No projeto, selecione Next.js e Node.js 24. Use `npm ci` para instalar e `npm run build` para compilar. Mantenha a saída padrão detectada pelo framework. Escolha uma origem HTTPS de produção estável e registre essa origem em `BETTER_AUTH_URL`; não use a URL temporária de cada preview.

Cadastre as variáveis de [.env.production.example](../.env.production.example) no painel seguro da Vercel. Gere novos `BETTER_AUTH_SECRET` e `DOCUMENT_KEY` por um gerenciador de segredos ou ferramenta criptográfica, respeitando os formatos de [PUBLICACAO.md](PUBLICACAO.md). Não reutilize segredos do desenvolvimento. Mantenha `ENABLE_DEMO=false`, `APP_MODE=live` e `DATABASE_POOL_MAX=2` como ponto inicial. O limite é por instância e requer acompanhamento de concorrência.

Não use prefixo `NEXT_PUBLIC_` em credenciais. Não coloque valores em comentários, prints, comandos que ficam no histórico ou commits. As URLs de banco/SMTP contêm senhas; trate-as como segredos completos. Usuário e senha devem estar corretamente codificados para o formato URL.

## 3. Provedor SMTP: preparar confirmação e recuperação

Cadastre-se num provedor SMTP adequado, como [Brevo](https://www.brevo.com/), e confirme suas condições atuais. Autorize o remetente e faça a configuração DNS exigida pelo serviço. Um domínio próprio pode ter custo mesmo quando a hospedagem tem plano gratuito. Se o plano permitir apenas destinatários de teste, limite a apresentação a esses destinatários.

Use TLS direto (`smtps://`) ou SMTP com STARTTLS obrigatório (`smtp://` com `?requireTLS=true`). O checker não aceita opções que desativam validação de certificado ou permitem envio sem TLS. `MAIL_FROM` deve conter um único remetente autorizado. O SMTP local Mailpit não faz entrega externa e não serve para a publicação.

## 4. Preparar e verificar a configuração administrativa

Num checkout com Node.js 24 e dependências de desenvolvimento instaladas:

```sh
npm run deploy:prepare
```

O comando cria `.local/production.env` e `.local/migration.env` **sem credenciais**, com permissão 600. Uma execução posterior preserva arquivos existentes. Eles são ignorados pelo Git e pelo build Docker, e não são carregados automaticamente pelo Next.js. Preencha os valores somente por um mecanismo seguro. `production.env` usa a conexão de runtime; `migration.env` precisa apenas da conexão de migração em `DATABASE_URL`.

Faça primeiro a validação estática:

```sh
node --env-file=.local/production.env --import=tsx scripts/check-deployment.ts
```

Equivalente para valores já injetados no processo: `npm run deploy:check`. O checker não carrega `.env.local` automaticamente, não imprime valores e não tenta conexão nesta etapa. Ele retorna código 1 se houver configuração inválida. Código 0 comprova somente a validação estática, sem comprovar acesso ao banco, entrega de e-mail ou aprovação institucional. Não coloque essa checagem no build da Vercel sem configurar as variáveis correspondentes ao ambiente selecionado.

Depois de conferir o destino da conexão de migração, aplique o schema:

```sh
node --env-file=.local/migration.env --import=tsx scripts/migrate.ts
```

Execute a verificação de serviços:

```sh
node --env-file=.local/production.env --import=tsx scripts/check-deployment.ts --connect
```

Esse modo confere conexão PostgreSQL e nomes/checksums das migrações por consultas de leitura. Também verifica conexão e autenticação SMTP, **sem enviar mensagens**. Configuração estática inválida impede essas conexões. Falhas são resumidas sem imprimir erros do provedor que possam conter credenciais. O comando não cria projetos, não aplica migrações, não altera perfis e não publica o site.

## 5. Conferir a implantação final

No domínio final, confirme `/api/health` com `ready` e teste cadastro, recebimento da confirmação, login e recuperação de senha com contas autorizadas de teste. A verificação SMTP não comprova entrega, autorização do remetente ou passagem pelos filtros de spam.

Depois da confirmação da primeira conta sindical, um operador pode conceder a função pelo checkout administrativo, usando a configuração de migração:

```sh
node --env-file=.local/migration.env --import=tsx scripts/grant-admin.ts pessoa@example.test ADMIN
```

O endereço acima é um exemplo; substitua-o pela conta real já existente, verificada e autorizada. Essa concessão registra auditoria e não cria senha padrão. Confira os fluxos com trabalhadores, empregadores e sindicato separados. Defina os contatos, atendimento e política institucional antes de utilizar dados pessoais reais. `SITE_POLICY_STATUS` é somente um registro operacional e não aprova nem substitui o texto mostrado pelo site.

Os comandos administrativos precisam de um checkout com `tsx`, arquivos SQL e demais dependências; não são incluídos no container de runtime standalone. Para a verificação local das ferramentas, use `npm run test:server` e `npm run test:live -- --grep 'Implantação:'`.

Modelo recomendado para configuração/implantação: GPT-6.1 Sol. Para revisão complementar das permissões e políticas: GPT-6 Astra. A recomendação não muda o modelo ativo automaticamente.
