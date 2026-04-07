# Story 1.5 — Vista del Cliente (Portal Público)

## Objetivo
Criar uma página web pública, acessível via link único (sem necessidade de login), para que o cliente consulte o status da sua tiquetera pelo próprio celular de casa.

## Dependencias
- [x] Story 1.3: Gestión de Tiqueteras (As tiqueteras já têm campo `token_publico`).
- [x] Story 1.4: Marcación Diaria (A contagem de consumos deve refletir ao vivo).

## Criterios de Aceptación (Acceptance Criteria)
1. **Página Pública (AC 1):** Rota `/mi-tiquetera/[token]` deve renderizar o overview de dados lendo o registro atrelado ao `token_publico`. Não pode ter proteção de rotas (middleware allowance). Se o token for inválido, mostrar página de "Não encontrado".
2. **Dashboard do Cliente (AC 2):** Informações claras: Nome (Hola João!), Datas (Início e Fim) e Barra de progresso visual de uso do plano (Ex: 22 de 30 consumidos).
3. **Renovação por WhatsApp (AC 3):** Botão verde flutuante que roteia para o WhatsApp do restaurante com a mensagem: "Olá Linda Mariana! Quero renovar minha tiquetera de XX dias. Meu nome é XY."

## Tarefas / Subtarefas
- [ ] 1. Roteamento Público Integrado
  - [ ] Liberar rota `/mi-tiquetera/[id]` no `middleware.ts` do Supabase para acessos deslogados.
- [ ] 2. Componente Mobile-First Next.js
  - [ ] Desenvolver `src/app/mi-tiquetera/[token]/page.tsx`.
  - [ ] Consulta do SSR no banco via server client pelas informações enxutas de tiquetera + cliente associado + contagem de `marcaciones`.
- [ ] 3. Progress Bar e Visuals
  - [ ] Implementar as Barras de Progresso e cálculo dinâmico de `Math.round((usadas/tipo) * 100)`.
- [ ] 4. Link Generator no Frontend Administrativo
  - [ ] Nas páginas de administrador, incluir botão/link para "Copiar Link do Cliente" ou "Enviar por Zap" enviando para `/mi-tiquetera/{token}`.

## Dev Agent Record
### Agent Model Used
(A ser preenchido pelo Agente Dev)

### Completion Notes List
(A ser preenchido pelo Agente Dev)

### File List
(A ser preenchido pelo Agente Dev)

## QA Results
(A ser preenchido pelo Agente de QA)
