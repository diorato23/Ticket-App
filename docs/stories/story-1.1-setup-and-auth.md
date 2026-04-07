# Story 1.1: Setup e Autenticação

## Status
Approved

## Executor Assignment
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: ["Manual"]

## Story
**Como** Administradora do Sistema (Mariana)
**Eu quero** fazer login com segurança no sistema com diferentes roles/papéis
**para que** eu possa proteger os dados do negócio e dar acesso restrito aos meus operadores.

## Acceptance Criteria
1. O projeto Next.js está totalmente inicializado com Tailwind CSS, Shadcn UI, e Zustand.
2. O cliente do Supabase está configurado.
3. A tabela do banco de dados `usuarios` está criada de acordo com o modelo da arquitetura.
4. O Supabase Auth está integrado para login com Email/Senha.
5. O Admin pode fazer login com email e senha e ser redirecionado para um `/dashboard` (tela provisória).
6. O Operador pode fazer login com email e senha e ser redirecionado para um `/marcacion` (tela provisória).
7. A sessão persiste entre os recarregamentos do navegador (até 30 dias).
8. A interface de usuário usa a paleta de cores "Linda Mariana" definida no tech stack (Primária `#F5A623`, etc).
9. Rotas protegidas devem redirecionar usuários não logados de volta para a tela de `/login`.

## 🤖 Integração CodeRabbit

### Análise de Tipo de Story
**Tipo Principal**: Segurança/Autenticação
**Tipo(s) Secundário(s)**: Frontend, Infraestrutura
**Complexidade**: Média

### Atribuição de Agentes Especializados
**Agente Primário**:
- @dev

**Agentes de Suporte**:
- @architect

### Tarefas do Quality Gate
- [ ] Pré-Commit (@dev): Executar antes de marcar a story como "Done", verificar as regras (RLS) e o fluxo do Auth.
- [ ] Pré-PR (@github-devops): Executar antes de criar o pull request.

### Configuração de Auto-Correção (Self-Healing)
**Auto-correção Esperada**:
- Agente Principal: @dev (modo auto_fix)
- Max Iterações: 2
- Timeout: 15 minutos
- Filtro de Severidade: HIGH, CRITICAL

**Comportamento Previsto**:
- Problemas CRITICAL: auto_fix
- Problemas HIGH: document_only

### Áreas de Foco para Avaliação
**Foco Principal**:
- Segurança: Implementação da autenticação e das sessões
- Políticas RLS: Garantir que a tabela de usuários esteja restrita

**Foco Secundário**:
- Frontend: Implementar as variáveis de cores da marca no Tailwind
- Componentes: Acessibilidade do formulário de login no teclado

## Tarefas / Subtarefas
- [x] 1. Inicialização do Projeto (AC 1, AC 8)
  - [x] Inicializar o projeto App Router com Next.js 14/15.
  - [x] Configurar o Tailwind CSS com as cores da marca Linda Mariana.
  - [x] Configurar o Zustand para controle de estado global.
  - [x] Instalar o Shadcn UI e os componentes fundamentais (Button, Input, Form, Card).
- [x] 2. Integração do Supabase (AC 2, AC 3)
  - [x] Instalar `@supabase/ssr` / `@supabase/supabase-js`.
  - [x] Configurar chaves no `.env.local` e funções cliente do Supabase.
  - [x] Criar o script SQL/DBML para `usuarios` e executar no Supabase.
- [x] 3. Implementação de Autenticação (AC 4, AC 5, AC 6, AC 7, AC 9)
  - [x] Criar a UI na rota base `/login` com inputs de Email e Password.
  - [x] Conectar a API de login do Supabase Auth no Frontend.
  - [x] Criar a proteção das rotas validando se há uma sessão ativa (`middleware.ts` ou hooks).
  - [x] Implementar redirecionamento automático baseado na coluna `rol` da tabela ou meta de `user`: (Admin para `/dashboard`, Operador para `/marcacion`).

## Notas do Dev
- **Contexto da Arquitetura**: Utilizar a arquitetura PWA + Serverless já desenhada. Usaremos o Supabase Auth com SSR Cookies para manter controle total de quem acessa o quê sem gerar lag.
- **Paleta de Cores**: Já defina no Tailwind as cores base: `primary: '#F5A623'`, `primary-dark: '#D4891A'`, `secondary: '#1A1A1A'`.
- **Banco de Dados**: Vincule as lógicas de auth se possível com o App router Actions. 

## Change Log
| Date | Version | Description | Author |
|---|---|---|---|
| 2026-04-07 | 1.0 | Traduzido e estruturado | @sm (River) |

## Dev Agent Record
### Agent Model Used
Gemini 3.1 Pro (High)

### Debug Log References
N/A

### Completion Notes List
- Next.js framework configurado junto com Tailwind, Zustand e pacote do Supabase (SSR & JS).
- Frontend inicializado com as cores 'Linda Mariana' (#F5A623 e variações).
- Tabela `usuarios` e banco de dados refletem os dados de forma online pelo Supabase.
- O Middleware protege e gerencia cookies corretamente redirecionando '/dashboard' e '/marcacion' .
- Inicializado o Shadcn UI junto com os componentes fundamentais: Button, Input, Form, Card, Label. 
- Story 1.1 totalmente concluída.

### File List
- `package.json`
- `src/app/globals.css`
- `src/middleware.ts`
- `src/lib/supabase/middleware.ts`
- `src/app/login/page.tsx`
- `src/app/login/actions.ts`
- `src/components/ui/*` (button, input, form, card, label)

## QA Results
(Aguardando Agente de QA)
