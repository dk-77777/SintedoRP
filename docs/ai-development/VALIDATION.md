# Validação V6

| Verificação | Resultado |
|---|---|
| Testes de servidor | 11/11 |
| E2E demonstrativo | 15/15 |
| Live com PostgreSQL/SMTP e sessões reais | 20/20; log em artifacts/cinematic-v6/live-final.log |
| Matriz visual live | 185 casos; zero overflow/exceções |
| Captura antes | 74 casos; zero overflow/exceções |
| Prévia offline | 37 telas × 3 larguras; interações de inspeção e assets offline aprovados |
| Gravação | Screencast real Chromium, 16,60 s, 1440×900; dados sintéticos |
| Performance de laboratório | LCP 304–784 ms; CLS 0 em 6 amostras; sem throttling e sem validade de campo |

As suítes incluem auditorias automáticas WCAG A/AA, não uma certificação completa. A gravação complementa capturas estáticas para demonstrar movimento. O último refinamento foi uma máscara de iluminação na transição e uma camada de fechamento do hero; checagens dirigidas finais registradas abaixo após execução.

## Conferência final após retomada
Typecheck e build de produção aprovados. Os cinco testes dirigidos de motion/sem-JS/filtros/acessibilidade passaram no build final (motion-final.log). Home recapturada em 375/390/768/1024/1440: cinco casos sem overflow. Prévia offline reverificada com sucesso. Vídeo regravado no build final: 16,60 s, 747 quadros capturados antes da codificação. Diff confirmou ausência de mudanças em src/server, APIs e migrações.
