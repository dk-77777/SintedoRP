# Página inicial — cuidado e respeito

A referência fornecida orientou a composição: abertura ampla, título forte à esquerda e objeto escultórico à direita. A escultura gerada representa mãos de bronze sustentando uma casa, conectando cuidado, trabalho doméstico e apoio sindical. Não representa pessoa real nem um monumento existente.

A paleta continua em laranja queimado, marfim e carvão. O título “Quem cuida merece respeito” apresenta a proposta, com acesso a vagas, funcionamento e cadastro. A busca e as oportunidades usam uma estrutura de leitura com linhas e divisórias.

O movimento acompanha a rolagem no desktop, com deslocamento limitado a 70 px. É desativado em telas menores que 900 px e quando o sistema solicita movimento reduzido. Não há alteração da velocidade de rolagem do navegador. No celular, a imagem aparece abaixo das ações e a legenda fica fora da escultura.

O arquivo de imagem usado no site é WebP com transparência, 1024 × 1536 px, aproximadamente 254 KB. Next/Image gera versões adequadas à tela e prioriza seu carregamento. A prévia offline incorpora a imagem e reproduz o parallax.

Arquivos principais: src/live/home.tsx, src/styles/home.css e public/images/cuidado-escultura.webp. A classe de página inicial limita os ajustes do cabeçalho e do fundo a essa rota. O componente Home é exportado em src/live/public.tsx, preservando o roteamento existente.

Verificado: busca levando a /vagas com a consulta correta; imagem carregada; inicial em 360, 390, 768 e 1440 px; 37 telas da prévia offline em 360, 768 e 1440 px; menus, diálogos, conversas, CPF/CNPJ, senha, parallax e movimento reduzido. As verificações da prévia usam dados fictícios e não demonstram funcionamento das integrações externas.

Esta etapa aplica a referência à página inicial. As próximas páginas podem receber referências específicas, seguindo a mesma paleta.

O build de produção com webpack também passou, incluindo a checagem TypeScript. O servidor de produção entregou a imagem WebP com HTTP 200 e o tamanho esperado. Dockerfile e scripts/start.mjs incluem a pasta public na execução da aplicação.
