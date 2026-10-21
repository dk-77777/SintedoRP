# Limitações e situação final

Sem bloqueio de implementação. Banco e SMTP locais isolados permitiram testar sessões/autenticação reais. Segredos recebidos não foram lidos nem usados.

- Referências visuais externas não foram examinadas; imagens locais das referências não foram fornecidas.
- As metas de LCP/CLS/INP e 60 FPS em dispositivos reais dependem de medição em produção. O JSON de laboratório informa condições e valores observados; não extrapolar.
- A prévia HTML usa dados fictícios e não executa cadastros/operações reais. A aplicação no ZIP preserva backend e regras existentes.
- O modo demonstrativo legado recebe tokens globais, mas seu componente de home não foi substituído pela home live V6; a V6 está na plataforma real (APP_MODE=live ou padrão).
- O CSS legado amplo permanece parcialmente duplicado; a folha V3 foi removida e estilos das áreas alteradas foram consolidados sem reescrita do sistema inteiro.
- O Better Auth emitiu aviso de resolução de IP na execução local; a configuração de proxy de produção não foi alterada nesta entrega.

Corrigidos: conteúdo da home sem JavaScript, seletor do teste de linhas, banco fixo no teardown, exportação de imagens/fontes da prévia, espera de decode em imagem lazy e tipagem dos utilitários de medição/gravação.
