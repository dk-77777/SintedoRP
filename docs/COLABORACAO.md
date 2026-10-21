# Colaboração no Conecta SINTEDORP

O repositório reúne o código, imagens necessárias, migrações, testes e documentação. Credenciais, banco local, dependências instaladas, relatórios temporários e arquivos gerados ficam fora do Git. O repositório informado pela equipe é público; a visibilidade foi preservada. A leitura é aberta, mas a permissão para enviar alterações depende do acesso concedido pelo proprietário.

## Primeiro acesso

1. Use sua própria conta GitHub. Para enviar alterações diretamente ao repositório, peça ao proprietário acesso como colaborador e aceite o convite.
2. Clone pelo GitHub Desktop ou pelo comando Clone do VS Code. Enquanto a atualização não estiver integrada à `main`, selecione a branch `atualizacao-v6-2026-10-21` após clonar. Abra a pasta clonada no editor.
3. Instale Node.js 24 e Docker Desktop. O projeto declara Node 24 em `.nvmrc` e `package.json`.
4. Abra o Docker Desktop e aguarde Engine running. No terminal da pasta do projeto, execute os comandos abaixo.

```powershell
npm.cmd ci
npm.cmd run services
npm.cmd run db:migrate
npm.cmd run dev
```

No macOS/Linux, use `npm` no lugar de `npm.cmd`. No Windows, o script procura o Docker no PATH e nas instalações usuais do Docker Desktop. As imagens são baixadas na primeira execução, o que exige acesso à internet. A porta 5432 deve estar disponível para este banco; 1025 e 8025 são usadas pelo e-mail de teste.

Para clonar a atualização diretamente pelo terminal:

```sh
git clone --branch atualizacao-v6-2026-10-21 https://github.com/dk-77777/SintedoRP.git
cd SintedoRP
```

Abra http://localhost:3000 e confira http://localhost:3000/api/health. O resultado esperado é `{"status":"ready"}`. O Mailpit fica em http://localhost:8025 e captura os e-mails de confirmação e recuperação sem enviá-los ao público.

O comando `services` cria configurações privadas somente quando ausentes. Cada integrante usa seu próprio banco e segredos locais. O banco novo começa sem contas ou vagas reais; isso é esperado. Não use a conexão do banco institucional para desenvolver.

Se já existir um container `conecta-sintedorp-db` neste computador, preserve os arquivos privados da instalação que o criou. O script interrompe a preparação se esses arquivos estiverem ausentes, para evitar gerar credenciais incompatíveis com os dados existentes. Não apague o banco para contornar esse aviso.

## Fluxo de alterações

1. Atualize sua cópia antes de começar, usando Pull no GitHub Desktop.
2. Crie uma branch para a tarefa, por exemplo `ajuste-home`.
3. Edite e confira as mudanças localmente.
4. Faça um commit com uma descrição objetiva e envie a branch usando Push.
5. Abra um pull request para a equipe revisar antes de integrar à `main`.

Ao revisar, verifique o comportamento, a aparência quando aplicável e os testes relevantes. Evite editar arquivos da mesma tarefa em paralelo sem combinar com a equipe. Publicar código no GitHub não cria automaticamente uma hospedagem do site.

## Verificações

```powershell
npm.cmd run typecheck
npm.cmd run test:server
npm.cmd run build
npm.cmd run test:visual
```

Os testes visuais usam o servidor em localhost:3000 e respostas simuladas de API; eles não comprovam a integração real. No Windows, utilizam o Google Chrome instalado. Os testes live completos são separados, usam banco temporário e Mailpit e estão documentados no README. Para esses testes, instale o navegador do Playwright conforme necessário e preserve as guardas de isolamento do banco.

## Compartilhar o site durante uma sessão

O Live Share do VS Code permite uma sessão conjunta. Inicie o site e o Docker, compartilhe a sessão com os integrantes e compartilhe somente a porta 3000 em Shared Servers. Seu computador precisa permanecer ligado. A sessão termina quando você encerra o compartilhamento. Não compartilhe portas do banco ou terminais com credenciais.

Para acesso em horários diferentes, será necessário um ambiente de teste hospedado, com banco e remetente de e-mail próprios. Definam a plataforma e as permissões do plano antes de publicar. A Vercel Hobby tem restrições para colaboração e deploys de repositórios privados; confiram as condições oficiais e o relatório de hospedagem.

## Arquivos privados

Não adicione `.env.local`, `.local/`, senhas, chaves, cópias do banco, e-mails capturados ou credenciais de produção aos commits. Os arquivos `.env.example` e `.env.production.example` são modelos sem segredos e podem ser versionados. Não compartilhe uma cópia preenchida pelo chat do grupo.

Para retomar o ambiente e entender o incidente de conexão anterior, consulte [Como abrir e manter o site](COMO-ABRIR-E-MANTER-O-SITE.md). Para escolher a hospedagem e definir responsabilidades, consulte o [relatório para a equipe](RELATORIO-HOSPEDAGEM.md).
