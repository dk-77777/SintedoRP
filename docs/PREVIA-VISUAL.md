# Prévia visual para abrir no navegador

Em 7 de outubro de 2026, foi preparada uma apresentação visual das telas atuais, com dados fictícios e sem registros do banco local. O arquivo principal é `artifacts/previa-visual/Conecta-SINTEDORP-previa.html`. O pacote `artifacts/Conecta-SINTEDORP-previa.zip` inclui o HTML, capturas, instruções e a lista de pendências.

Depois de baixar e extrair, abra o HTML no Chrome, Edge ou Firefox. Use **Visualizar perfil** e **Visualizar tela** na barra superior, ou os menus do site. O arquivo incorpora o CSS e os ícones; não precisa de Node.js, serviços locais ou conexão à internet.

São 37 telas após o redesign: início, vagas/detalhe, acesso/cadastro/recuperação, informações, CPF/CNPJ e áreas de trabalhador, empregador e sindicato, incluindo lista e conversa privada em telas separadas. O histórico inclui a proposta de encerramento com confirmação da outra parte. O relatório apresenta números fictícios para permitir avaliar o layout, com tabela no desktop e cartões no celular.

Esta é uma prévia visual navegável. Formulários, filtros, envio de mensagens, moderação e CSV não executam operações. Menus, filtros expansíveis, detalhes, mostrar/ocultar senha e diálogos de confirmação permitem inspecionar a apresentação. Nenhum dado digitado é enviado, e não há autenticação ou persistência real no arquivo. A versão funcional completa continua usando Next.js, PostgreSQL e Better Auth no servidor.

## Como foi verificado

As telas foram capturadas da aplicação atual em execução, com todas as respostas de API substituídas por fixtures tipadas em `scripts/preview-data.ts`. Não foi criado login, não foram lidas contas reais e nenhum registro de produção foi exportado. Scripts/assets do Next.js foram removidos das telas; a navegação offline usa o próprio HTML e proíbe conexões por CSP.

O HTML anterior foi verificado em 35 telas; a atualização do redesign amplia a captura para 37 telas. A verificação carrega os mesmos bytes do HTML diretamente no navegador, sem depender de rede, pois o navegador gerenciado deste ambiente bloqueia navegação `file://`. A abertura por arquivo num navegador pessoal segue como procedimento de uso. Os resultados da atualização constam em [REDESIGN-2026.md](REDESIGN-2026.md).

## Atualizar a prévia

Com o build atual pronto e uma porta local livre, inicie o aplicativo nessa porta/origem pelo launcher existente. O exportador aceita somente origem local e usa fixtures, inclusive para áreas privadas. Não utilize uma implantação externa como origem de captura.

```sh
PREVIEW_ORIGIN=http://localhost:3305 npx tsx scripts/export-visual-preview.ts
```

O servidor dessa porta precisa estar em execução. Este comando produz HTML, instruções e capturas em `artifacts/previa-visual`; o ZIP é empacotado separadamente. Artefatos são ignorados pelo Git. O exportador é uma ferramenta de apresentação e não altera a aplicação, migrações ou dados do banco.

Para verificar o arquivo gerado, execute `npx tsx scripts/verify-visual-preview.ts`. A checagem não precisa de servidor nem consulta dados reais.

## Pendências para concluir

O detalhamento entregue está em `artifacts/previa-visual/O-QUE-FALTA-PARA-FINALIZAR.txt`, com base em [PUBLICACAO.md](PUBLICACAO.md): envio do código ao GitHub, projetos externos, HTTPS/segredos/migrações, entrega real de e-mail, definições oficiais do sindicato e política institucional, consulta externa CPF/CNPJ se exigida, revisão/testes em produção, backup/restauração e melhorias para bases maiores. O usuário informou que os projetos Vercel/Supabase ainda não foram criados.
