# Preparação para publicação

O ambiente em nuvem e o MVP local estão preparados. Não houve envio ao GitHub nem publicação pública. O repositório remoto informado estava vazio; o código está no checkout local e não existe um commit enviado para `main`.

## Pacote de execução

`npm run build` produz `.next/standalone`; `npm run start` inicia esse pacote e copia seus arquivos estáticos. O Dockerfile usa Node 24, executa `npm ci` pelo lockfile e gera uma imagem com usuário sem privilégios. Arquivos `.env*`, `.local/`, testes gerados e credenciais locais ficam fora do contexto de build.

```sh
docker build -t conecta-sintedorp:local .
```

Em redes com proxy TLS corporativo, forneça a CA confiável por secret de build `proxy_ca` e configure o proxy pelo mecanismo padrão do Docker. A CA só existe no passo de instalação. Não desative TLS nem a verificação dos pacotes. No ambiente em nuvem atual, o build foi verificado usando o proxy existente e sua CA, sem incluir essa configuração na imagem.

O container precisa receber as variáveis de execução da hospedagem e acesso ao PostgreSQL já migrado. `/api/health` verifica conectividade e migrações; o healthcheck da imagem consulta essa rota. Migrações são aplicadas pelo operador antes de iniciar uma nova versão, pelo comando `npm run db:migrate` em um checkout com dependências de desenvolvimento. Não crie bancos ou serviços de produção com `npm run services`: esse comando prepara somente o desenvolvimento local.

## Configuração da hospedagem

| Variável             | Uso                                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL privado; TLS e permissões conforme o provedor. Não desative validação de certificado.                             |
| `DATABASE_POOL_MAX`  | Inteiro de 1 a 12, por instância; padrão 12. Em serverless, começar com 2 e monitorar o total de conexões.                   |
| `BETTER_AUTH_URL`    | Origem HTTPS final, exatamente igual à usada pelos participantes.                                                            |
| `BETTER_AUTH_SECRET` | Segredo exclusivo da implantação; pelo menos 32 caracteres aleatórios.                                                       |
| `DOCUMENT_KEY`       | Chave de 32 bytes, em 64 caracteres hexadecimais; guardar separadamente do banco/backups.                                    |
| `SMTP_URL`           | Serviço de e-mail contratado, com conexão autenticada e TLS.                                                                 |
| `MAIL_FROM`          | Remetente institucional autorizado e domínio configurado no provedor.                                                        |
| `ENABLE_DEMO`        | `false` na implantação institucional.                                                                                        |
| `TRUSTED_IP_HEADER`  | Cabeçalho substituído pelo proxy confiável, quando a origem só aceitar tráfego desse proxy. Deixar vazio no desenvolvimento. |
| `SITE_POLICY_STATUS` | Registro operacional da situação da política; atualmente `draft`. Não altera ou aprova a política exibida.                   |

Sem proxy confiável definido, o limite de autenticação usa um contador compartilhado por rota. Isso evita confiar em IP enviado pelo cliente, mas limita também tentativas de outros usuários. Configure o proxy real antes de uso público; não basta preencher um cabeçalho sem impedir sua falsificação. O teste integrado confirma que variar `x-forwarded-for` não contorna o limite padrão.

Apenas as variáveis de runtime devem conter credenciais. Não passe segredos de produção como argumentos de build, não copie `.env.local` para a imagem e não reutilize os segredos locais. Os arquivos privados gerados em desenvolvimento são ignorados pelo Git.

## Definições externas pendentes

- Hospedagem, domínio, HTTPS, PostgreSQL administrado, backup e restauração testada.
- Provedor de e-mail e autorização do remetente; entrega externa ainda não foi testada. Mailpit captura somente e-mails locais.
- Identidade visual e contatos oficiais do SINTEDORP, responsáveis pelo atendimento e permissões de cada pessoa da equipe.
- Política institucional: responsável pelo tratamento, finalidades/bases legais, retenção, atendimento aos direitos dos titulares e regras de publicação das avaliações. O texto atual é uma orientação de desenvolvimento.
- Convenções, vigências e critérios de análise de remuneração/jornada. O MVP não inventa um piso salarial oficial.
- Provedor de consulta CPF/CNPJ, contrato, finalidade e credenciais, se a instituição decidir ativar consulta externa. Hoje há validação local dos dígitos e verificação manual separada; não há consulta à Receita Federal.

## Limites desta versão

A interface carrega um conjunto de dados autorizado por sessão; paginação de consultas no servidor e testes de carga são próximos trabalhos para bases grandes. Conversas atualizam após envio e por consulta periódica, sem WebSocket. Experiências autodeclaradas permanecem privadas ao trabalhador; empregadores veem somente experiências relacionadas às suas próprias contratações. Uma experiência iniciada sem data final pode receber uma proposta de encerramento: a outra parte precisa confirmar a data antes da avaliação. Uma recusa mantém o período anterior e abre um atendimento; as propostas são preservadas. Datas finais já confirmadas não são editadas.

Permissões sindicais são provisionadas por CLI, sem convites por e-mail ou painel de concessão. O atendimento trabalha com relatos enviados; a equipe sindical não recebe acesso geral às conversas privadas. Suspensão encerra sessões, mas não apaga mensagens, histórico ou auditoria. Uma política de retenção/exclusão precisa ser definida antes do uso institucional.

Auditoria automatizada de acessibilidade e testes de autorização cobrem os percursos descritos em `ETAPAS-04-A-07-RESULTADOS.md`; não substituem revisão institucional, avaliação manual assistiva completa ou auditoria de segurança externa. GPT-6 Astra é a recomendação para essa revisão complementar; a indicação não afirma troca do modelo ativo.

## Ambiente em nuvem

Foram preparados PostgreSQL, Mailpit, dependências, migrações, build, testes e instruções reutilizáveis. Os campos `install_script` e `start_skill` foram salvos no rascunho da configuração, com resultado confirmado pelo serviço. O produto oferece a revisão/salvamento e a publicação desse ambiente. Publicar o ambiente cria uma versão de configuração/snapshot; processos vivos precisam ser reiniciados conforme `start_skill`.

A publicação do ambiente de desenvolvimento não publica o site para participantes reais e não configura automaticamente domínio, SMTP ou APIs externas.

O roteiro para apresentação acadêmica em Vercel e Supabase está em [HOSPEDAGEM-GRATUITA.md](HOSPEDAGEM-GRATUITA.md). Não foi criada implantação externa; planos, restrições e cotas devem ser conferidos antes da contratação/ativação.

O procedimento administrativo completo está em [CRIAR-CONTAS-E-PUBLICAR.md](CRIAR-CONTAS-E-PUBLICAR.md). `deploy:prepare` cria modelos privados sem credenciais e preserva arquivos existentes. `deploy:check` lê somente variáveis explicitamente injetadas, valida formato/origem/TLS e retorna falha antes de qualquer conexão quando faltam requisitos. `--connect` verifica schema/checksums PostgreSQL e autenticação SMTP sem mensagens. Ele não aplica migrações nem comprova entrega externa de e-mail ou aprovação institucional.
