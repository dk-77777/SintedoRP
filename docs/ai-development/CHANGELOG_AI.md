# Alterações

Base do ZIP limpo isolada e registrada em Git. Prompt reenviado idêntico ao anterior. .env.local presente no ZIP foi excluído da cópia de trabalho e não lido.

- Tokens quentes consolidados e folha refinement-v3 removida.
- home.css assume hero, transição e narrativa; access.css assume acesso; motion.css assume feedback.
- src/live/motion/ inclui componentes e tokens; hook usa importação dinâmica do GSAP.
- Quatro WebPs inéditos e quatro estudos renderizados.
- Home institucional passa a renderizar antes da API e fora do Suspense de páginas internas, preservando leitura sem JavaScript.
- Busca de categorias usa parâmetro funcao do filtro real.
- Extração de estilo duplicado da sidebar e dos indicadores; seleção laranja com indicador lateral.
- Exportador de prévia passa a incorporar todas as fotos, fonte local, access.css e motion.css.
- Novos testes de motion e captura em vídeo real do navegador.
- Nenhuma mudança em src/server, migrations ou APIs.

- Teardown agora conecta ao banco de manutenção postgres, preservando a validação estrita de nomes de bancos temporários.
- Fechamento estacionário do hero e máscara da luz na transição evitam corte tonal durante scroll.
