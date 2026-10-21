# Motion Design System

| Cena | Arquivo | Técnica / trigger | Duração/easing | Mobile / reduced |
|---|---|---|---|---|
| Atmosfera | src/live/motion.ts | GSAP timeline, mount | 1,1 s power3.out | mesma entrada / estático |
| Headline | motion.ts + home.css | máscaras por overflow + translateY/rotate, mount | 0,9 s; stagger 0,11 s | tipografia menor / estado final |
| Conecta Flow | motion/components.tsx | SVG com gradiente e pathLength; dash sincronizado | 1,5 s; stagger 0,08 s | menos opacidade / sem desenho |
| Fotografia hero | motion.ts | clip-path, mount; transform no scroll | 1,25 s; scrub 0,65 | deslocamento 15 px em vez de 65 / parado |
| Atmosfera ao cursor | motion.ts | quickTo; pointer fino e hover | 1 s power2.out | desativado / desativado |
| Transição | SectionTransition | luz radial, SVG translate/rotate, ScrollTrigger | scrub 0,8; linear | curta / estática |
| TextReveal | motion/components.tsx | linha ou horizontal, viewport 92% | 0,85 s power3.out | igual / texto visível |
| ImageReveal | motion/components.tsx | cortina ou scale/clip, viewport 88% | 1,1 s power3.out | igual / foto visível |
| Vagas e etapas | motion.ts | deslocamento vertical, viewport 96% | 0,7 s; stagger local | igual / sem movimento |
| Encerramento | motion.ts | SVG rotaciona e desloca no scroll | scrub 1 | igual / parado |
| Login/cadastro | access.css | máscara da foto e entrada do formulário | 1 s / 0,65 s var(--ease-out) | arte oculta / estático |
| Feedback | motion.css | botões, links, erros, details, estados | 180–360 ms | sem dependência de hover / estático |

O conteúdo é visível por padrão. GSAP só aplica estados iniciais após carregar. `gsap.matchMedia().revert()` remove estilos/timelines/ScrollTriggers; listeners de pointer são removidos e importação tardia ignora componente desmontado. Sem pinning, Lenis ou bloqueio da rolagem. SVGs decorativos não entram na árvore acessível.

Validação de movimento: scroll de ida/volta, resize, saída/retorno de rota e troca de reduced-motion. A gravação usa screencast real do Chromium; capturas estáticas usam reduced-motion.
