# Etapa 8 — Encerramento de experiências e hospedagem acadêmica

Em 7 de outubro de 2026, foi corrigida a ausência de encerramento para experiências registradas em andamento. A continuidade segue autorizada pelo usuário, sem aprovação a cada etapa. Não houve commit/push ou publicação externa.

## Comportamento entregue

O trabalhador ou o empregador envolvido pode propor uma data final depois da confirmação inicial da experiência. A outra parte precisa responder; o proponente não aprova sozinho. Uma recusa mantém o período em andamento, preserva sua confirmação inicial, registra a proposta anterior e abre atendimento. Uma nova proposta pode ser feita depois da recusa.

O encerramento confirmado permite a avaliação, preservando a data original de confirmação utilizada nos relatórios. A data final aceita não é editada. Propostas simultâneas, formulários desatualizados, repetições e operações de terceiros são recusados no servidor. Registros autodeclarados podem ser encerrados pelo trabalhador e continuam privados, sem confirmação do empregador e sem avaliação.

A migração `004-experience-closure.sql` acrescenta propostas preservadas e controle de versão. As três migrações anteriores permanecem intactas. Datas são validadas e exibidas pelo calendário de São Paulo; o dia UTC do servidor não antecipa a aceitação de datas futuras.

## Evidências da versão final

| Verificação                   | Resultado                                                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Instalação reutilizável       | `scripts/cloud-install.sh` concluído: instalação por lockfile, reutilização dos serviços, migrações, build, tipos e testes de servidor |
| Migração repetida             | Quarta migração aplicada; execução seguinte não reaplicou alterações e verificou checksums                                             |
| Build e tipos                 | Build de produção e TypeScript passaram                                                                                                |
| Servidor                      | Cinco testes passaram: CPF, CNPJ, proteção documental e dois cenários de calendário                                                    |
| Integração real               | Seis testes passaram em 36,2 s com `DATABASE_POOL_MAX=2`, nenhum ignorado ou falho                                                     |
| Encerramento pela interface   | Proposta, recusa e confirmação pelos formulários/botões reais; avaliação liberada somente após acordo                                  |
| Concorrência e privacidade    | Duas propostas simultâneas resultaram em um sucesso e um conflito; terceiros não leram nem alteraram experiências                      |
| Acessibilidade/responsividade | Verificações existentes de 19 telas mantidas; formulário de encerramento pendente também passou no Axe com tags WCAG A/AA selecionadas |
| Pacote Docker                 | Imagem atual reconstruída, healthcheck healthy, `/api/health` ready, UID 1000, arquivos privados de desenvolvimento ausentes           |
| Inicialização standalone      | `/`, `/vagas` e `/entrar` retornaram HTTP 200 com interface carregada, sem exceções JavaScript; health ready                           |
| Limpeza                       | Zero bancos temporários `sintedorp_e2e_*` restantes; container de verificação removido após os checks                                  |

São **11 testes executados nesta rodada**. Os 15 testes do protótipo passaram na etapa anterior e não foram repetidos porque essa demonstração não foi alterada. Os resultados anteriores permanecem em [ETAPAS-04-A-07-RESULTADOS.md](ETAPAS-04-A-07-RESULTADOS.md). O uso de duas conexões foi testado localmente; não comprova capacidade de carga ou funcionamento numa implantação Vercel/Supabase ainda inexistente.

## Publicação preparada

Foi escrito o roteiro [HOSPEDAGEM-GRATUITA.md](HOSPEDAGEM-GRATUITA.md), com Vercel Hobby e Supabase Free para apresentação acadêmica, serviço SMTP separado, restrição de acesso público ao banco e diferenciação entre conexão de runtime e de migração. `DATABASE_POOL_MAX` permite ajustar de 1 a 12 conexões por instância; começar com 2 em serverless não elimina a necessidade de monitorar o total.

Planos, preços e cotas atuais não foram confirmados porque as páginas oficiais retornaram HTTP 403 neste ambiente. Vercel Hobby tem condição de uso pessoal/não comercial, a considerar antes da adoção institucional. Contas nos provedores, origem HTTPS, credenciais, remetente e entrega externa continuam pendentes. Os segredos devem ser inseridos nos painéis próprios, sem envio pelo chat.

As instruções de inicialização foram atualizadas para quatro migrações e leituras da etapa atual. O rascunho do ambiente salva instruções reutilizáveis; não publica o site. Para implantação, recomenda-se GPT-6.1 Sol; para revisão complementar das permissões e políticas, GPT-6 Astra. Essas recomendações não alteram automaticamente o modelo ativo.
