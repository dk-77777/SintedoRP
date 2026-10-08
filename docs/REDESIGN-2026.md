# Redesign do Conecta SINTEDORP

Implementado em 7 de outubro de 2026, a partir do diagnóstico do projeto e da direção visual proposta. O usuário autorizou a implementação depois da etapa de análise.

## Resultado

- Home com busca junto à proposta de valor, explicação do acompanhamento sindical e caminhos para trabalhar, contratar e pedir orientação. O acompanhamento fica expansível no celular.
- Identidade verde e neutra, hierarquia editorial nas páginas públicas e títulos diretos nas áreas de trabalho. Estilos da versão conectada ficam em `src/styles/redesign.css`, sob `.live-application`.
- Navegação da conta recolhida no celular; indicação do destino ativo também em edição de vaga e conversa específica; menu fecha por Escape e ao navegar.
- Filtros de vagas visíveis sob demanda no celular, chips removíveis e estado na URL. Filtros persistem ao recarregar e voltar de um detalhe.
- Painéis por perfil com pendências, ações contextuais, registros recentes e indicadores com labels legíveis. Analistas recebem apenas o acesso correspondente às suas permissões.
- Login em duas colunas no desktop e uma no celular, mostrar/ocultar senha, confirmação de e-mail sob demanda e erro junto ao formulário.
- Formulário de vaga agrupado por identificação, remuneração/jornada e atividades/benefícios.
- Histórico sem altura mínima herdada, com empregador, período, origem e confirmação explícitos. Confirmar/contestar experiência e aceitar/recusar encerramento usam diálogo com explicação da consequência, cancelamento e foco inicial seguro.
- Relatórios com resumo e comparação tabular no desktop; cartões por empregador e todos os indicadores acessíveis por expansão no celular. Alterar datas sinaliza que os resultados são anteriores e impede exportar com filtros ainda não aplicados.
- Formulários administrativos sob demanda, pesquisa por nome e confirmação explícita da alteração de acesso de uma conta.
- Avisos distinguem sucesso, erro e informação. Falha inicial de conexão não vira estado vazio; falha de atualização mantém os dados anteriores com aviso. Formulários mostram falhas próximas à ação.
- Mensagens apresentam lista e conversa separadamente no mobile. O caminho para voltar à lista permanece visível.

O redesign preserva as ações, permissões e regras de negócio do servidor. Não houve alteração de migrações, inclusão de serviços externos ou publicação pública.

## Validação

- `npm run typecheck`: passou.
- `npm run build`: passou; build final com os ajustes de home mobile e acesso desktop.
- `npm run test:server`: 11 testes passaram.
- `npm run test:live`: 15 testes passaram, incluindo 7 testes novos de interface, 6 cenários da plataforma real e 2 verificações de implantação.
- Após o ajuste final do destino ativo em `/painel`, o teste específico de navegação mobile foi executado novamente e passou, incluindo o caminho de entrada após login.
- `npm run test:e2e`: 15 testes da demonstração passaram.
- `npx tsx scripts/export-visual-preview.ts`: exportou 37 telas, usando somente fixtures, sem exceções na captura.
- `npx tsx scripts/verify-visual-preview.ts`: as 37 telas couberam em 360, 768 e 1440 px sem transbordamento da página. Menus, diálogos, conversas, CPF/CNPJ e mostrar/ocultar senha passaram. Zero exceções JavaScript e zero requisições HTTP no arquivo independente.
- Inspeção visual das capturas: início, login, painéis, histórico, formulário de vaga e relatórios em desktop/mobile.
- Serviço local respondeu HTTP 200 com `status: ready`. Os bancos temporários dos testes foram removidos; a consulta final encontrou zero bancos de teste.

As verificações automatizadas de acessibilidade são uma cobertura parcial: não substituem uso com leitores de tela, aparelhos físicos ou avaliação com os participantes do projeto.

## Arquivos para visualizar

`artifacts/previa-visual/Conecta-SINTEDORP-previa.html` incorpora os estilos e ícones das 37 telas. Pode ser baixado e aberto em um navegador pessoal. A barra superior seleciona o perfil e a tela. O ZIP `artifacts/Conecta-SINTEDORP-previa.zip` reúne o HTML, capturas, instruções, este documento e as pendências.

O arquivo é uma apresentação visual. Cadastro, autenticação, filtros de dados, envio de mensagens, moderação e CSV não operam no HTML offline; os menus, expansões, senha e diálogos permitem avaliar a interface. Nenhum valor digitado é enviado. A aplicação completa continua dependendo do servidor e do banco.

Capturas adicionais incluem acesso, pesquisa, painel e nova vaga, além de início, histórico e relatórios. Os registros e valores são fictícios. O navegador gerenciado bloqueia `file://`; a checagem offline carrega os mesmos bytes via `setContent`, sem desabilitar a política do navegador.

## Limitações e próximos passos

O MCP do Mobbin não disponibilizou ferramentas nesta sessão, inclusive após a nova tentativa de invocação para referências de login. Nenhuma busca ou referência foi atribuída ao Mobbin. O benchmark continua pendente até o conector disponibilizar suas ferramentas.

A implementação usa fontes do sistema e Georgia, mantendo a prévia independente e sem downloads de fontes. As fontes sugeridas no diagnóstico não foram incorporadas nesta entrega.

A identidade institucional, os contatos e a política de privacidade continuam sujeitos à validação do sindicato. A faixa de desenvolvimento e os textos provisórios permanecem para sinalizar a situação real do projeto. Hospedagem externa, SMTP real, eventual consulta cadastral CPF/CNPJ, testes no domínio final e procedimentos de backup ainda seguem os guias de publicação existentes. A aplicação permanece local, sem commit/push ou implantação externa nesta etapa.

Modelo recomendado para implementação: GPT-6.1 Sol; para a pesquisa/comparação de produto quando o Mobbin estiver disponível: GPT-6 Astra. A recomendação não altera automaticamente o modelo ativo.
