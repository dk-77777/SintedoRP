# Etapas 4 a 7 — MVP funcional e ambiente reproduzível

Status: implementação funcional concluída para desenvolvimento e validação com dados de teste. O usuário substituiu as aprovações por etapa pela autorização de continuidade sem novas pausas. Não houve publicação institucional ou envio ao repositório remoto.

## Entrega

Next.js 16.4.0, React 19.3.0, TypeScript 5.9.3, Better Auth 1.7.7, PostgreSQL 17.11, pg 8.16.3 e Nodemailer 10.0.15. Dependências diretas fixadas, lockfile e imagens dos serviços por digest.

O núcleo funcional inclui contas verificadas por e-mail, recuperação de senha, sessões persistidas, perfis trabalhador/PF/PJ, CPF/CNPJ protegido, concessão controlada de acesso sindical, vagas versionadas e moderadas, busca e candidaturas. Os módulos complementares incluem mensagens privadas, encaminhamento, histórico autodeclarado/confirmado, avaliações moderadas, resposta/contestação, atendimento, cadastros administrativos e relatórios/CSV.

O servidor valida permissões e propriedade dos recursos em cada operação. Identidade e situação cadastral não são inferidas da validação dos dígitos. Documentos são cifrados com AES-256-GCM e indexados por HMAC; não aparecem no estado entregue ao navegador. Consultas SQL são parametrizadas; mudanças de domínio e auditoria usam a mesma transação. Revisões não são editadas; candidaturas guardam a revisão originalmente publicada.

A demonstração de sessionStorage ficou em `/demo`, com navegação própria. O modo `APP_MODE=prototype` é usado somente no servidor da suíte antiga e não concede acesso às APIs funcionais.

## Evidências executadas em 7 de outubro de 2026

| Verificação              | Resultado                                                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Instalação por lockfile  | npm ci concluído após as mudanças finais de dependências; scripts/cloud-install.sh executado integralmente com sucesso |
| Serviços locais          | PostgreSQL e Mailpit obtidos por digest, iniciados e reutilizados sem apagar dados/configurações                       |
| Migrações                | Três migrações aplicadas; segunda execução não reaplicou alterações                                                    |
| Tipos e produção         | npm run typecheck e npm run build passaram; pacote standalone gerado                                                   |
| Documentos               | Três testes passaram: CPF, CNPJ numérico/alfanumérico e proteção/normalização                                          |
| Integração real          | Cinco testes passaram, nenhum ignorado; rodada final de 33,5 s, com conta sindical provisionada pela CLI real          |
| Demonstração             | Os 15 testes anteriores passaram; rodada de 50,1 s                                                                     |
| Acessibilidade funcional | Axe com tags WCAG A/AA selecionadas em 19 telas e no relatório preenchido: nenhuma violação detectada                  |
| Responsividade funcional | As mesmas 19 telas em 360, 768 e 1280 px: sem transbordamento horizontal da página                                     |
| Persistência/JavaScript  | Mensagem enviada pelo formulário, mantida após reload; sem exceções JavaScript observadas nos percursos                |
| Dependências de produção | npm audit --omit=dev: zero vulnerabilidades conhecidas após atualizar Nodemailer                                       |
| Container de execução    | Imagem construída, executada e healthcheck healthy; /api/health ready e /api/state HTTP 200                            |
| Privacidade do pacote    | Container executou como UID 1000; .env.local e .local ausentes da imagem                                               |
| Limpeza dos testes       | Banco isolado eliminado ao término; zero bancos sintedorp_e2e restantes na verificação                                 |

## Cenários comprovados

1. Cadastro não concede função sindical enviada pelo cliente; entrada sem confirmação de e-mail é recusada. O primeiro administrador é uma conta existente autorizada pela CLI, com auditoria.
2. Vaga pendente não aparece publicamente; trabalhador não aprova vaga. Uma edição exige nova decisão e conserva salário/revisão da candidatura. Decisão com versão desatualizada falha.
3. Candidatura duplicada falha; conversa aparece ao empregador envolvido. Terceiro não lê mensagens nem envia mensagem à candidatura alheia. Visitante não recebe candidaturas, histórico, documentos ou e-mail pessoal.
4. Avaliação anterior à confirmação das duas partes falha; avaliação e resposta ficam ocultas até moderação. Contestação oculta a avaliação e impede republicação ou resposta usada para contornar a análise.
5. Relatório distingue publicação de revisões, candidatura, contratação informada, confirmação e avaliação. Datas de setembro não contam encaminhamentos ocorridos em outubro. CSV neutraliza nome iniciado por fórmula.
6. Mudança sindical indevida, JSON excessivo e requisição de outra origem são recusados. Conta sindical também vinculada ao empregador não aprova a própria vaga. Analista recebe relatório, mas não modera.
7. Link de recuperação redefine a senha, encerra sessões antigas, rejeita reutilização e expiração. Senha anterior falha; nova senha permite acesso. Suspensão encerra a sessão; variar x-forwarded-for não contorna o limite de tentativas.

## Ambiente e decisões

Prisma foi removido após bloqueio de rede no download do mecanismo oficial. Foi adotado o adaptador PostgreSQL oficialmente documentado pelo Better Auth e SQL versionado com checksums. Nenhuma verificação de integridade/TLS foi desativada. O pacote de e-mail inicialmente escolhido tinha um alerta de segurança; foi atualizado e os fluxos de confirmação/recuperação foram repetidos com sucesso.

`scripts/cloud-install.sh` e `docs/INICIALIZACAO-AMBIENTE.md` são as instruções reutilizáveis para o ambiente. O Dockerfile permite empacotar a aplicação e foi verificado usando o proxy/CA disponíveis, com montagem temporária da CA. A origem e os segredos da hospedagem devem ser fornecidos no runtime, conforme `PUBLICACAO.md`.

Capturas de início, mensagens e relatórios em desktop/celular foram geradas em `artifacts/live/`; início desktop e mensagens em 360 px foram inspecionados visualmente. A auditoria automatizada não comprova acessibilidade assistiva completa ou ausência de toda vulnerabilidade.

## Pendências externas e limites

Domínio/hospedagem, entrega externa de e-mail, política institucional, contatos/identidade oficiais, critérios de remuneração e eventual contrato de consulta cadastral dependem de definição externa. O MVP funciona localmente sem essas integrações, mas não foi liberado para dados pessoais reais.

Limites de escala, provisionamento por CLI, retenção e atendimento estão descritos em `PUBLICACAO.md`. A lacuna de encerramento de experiências em andamento foi corrigida posteriormente, conforme [ETAPA-08-RESULTADOS.md](ETAPA-08-RESULTADOS.md); os números acima registram a rodada das etapas 4 a 7. Recomendação de modelo: GPT-6.1 Sol para implementação/ambiente; GPT-6 Astra para revisão complementar de segurança e regras. Não foi afirmada troca automática de modelo.

Verificação final de inicialização: o launcher carrega `.env.local` privado quando presente, preservando variáveis explícitas de runtime. A aplicação foi iniciada com origem alternativa correspondente à porta escolhida; `/api/health`, `/api/state`, `/`, `/vagas` e `/entrar` retornaram HTTP 200.
