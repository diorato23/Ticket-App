# Story 1.2: Gestão de Clientes

## Status
Approved

## Executor Assignment
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: ["Manual"]

## Story
**Como** Administrador (Mariana) ou Operador
**Eu quero** gerenciar os clientes do restaurante no sistema
**para que** eu possa ver os seus detalhes, fazer buscas rápidas e associar os cartões de almoço a eles no futuro.

## Acceptance Criteria
1. A tabela `clientes` do banco de dados está criada de acordo com a arquitetura do banco.
2. A nova tela `/clientes` vai exibir em lista todos os registros dos clientes.
3. A lista pode ser pesquisada em tempo real filtrando o `nombre` ou um pedaço do `telefono_wsp` (ao digitar "714" deve achar "3146713097").
4. Admin ou Operador pode criar clientes na listagem modal com: `nombre` (obrigatório), `telefono_wsp` (10 digitos, obrigatório) e `notas` (opcional).
5. Exclusivo de Admin: Só a Mariana pode entrar nos detalhes do cliente para Editar o cadastro.
6. Exclusivo de Admin: Só a Mariana pode "soft-delete" / inativar o cliente (deixando `activo = false`).
7. Ao clicar em cima do cliente ele abrirá uma tela de detalhamento `/clientes/[id]`.

## 🤖 Integração CodeRabbit

### Análise de Tipo de Story
**Tipo Principal**: Banco de Dados/API
**Tipo(s) Secundário(s)**: Frontend
**Complexidade**: Baixa

### Atribuição de Agentes Especializados
**Agente Primário**:
- @dev

**Agentes de Suporte**:
- @db-sage

### Tarefas do Quality Gate
- [ ] Pré-Commit (@dev): Antes de fechar a tarefa, o Dev deve testar buscas e garantir tempo de busca < 500ms.
- [ ] Pré-PR (@github-devops): Copia limpa para revisão de PR.

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
- Banco de Dados: Garantir que Operadores não façam ações exclusivas de Admin através de API exposta.
- Busca: Restringir a carga de dados para que não force banda durante a busca.

**Foco Secundário**:
- Frontend: Implementar modais/formulários responsivos acessíveis pelo teclado.
- Inputs: Proteger o campo de telefone para validar sempre formato sem mascara gringa (nada de "+57").

## Tarefas / Subtarefas
- [x] 1. Configuração de Banco de Dados (AC 1)
  - [x] Criar a tabela `clientes` com os dados da modelagem, através de script do Supabase.
  - [x] Aplicar RLS Policies para segurar Update/Delete a nível Administrador.
- [x] 2. Tabela de Listagem de Clientes e Busca Rápida (AC 2, AC 3)
  - [x] Elaborar tela `/clientes` integrando os visuais da Shadcn (listagem e headers de busca).
  - [x] Fazer componente de barra de procura com controle de debounce via `.ilike()` ou text/params em tempo real ao BD.
- [x] 3. Funções CRUD na Interface UI (AC 4, AC 5, AC 6)
  - [x] Modal lateral / Dialog de formulário "Novo Cliente".
  - [x] Integração com Zod/React-Hook-Form do Shadcn limitando Telefone WhatsApp apenas em 10 digitos obrigatoriamente.
  - [x] Construir lógica condicional validando `rol` da sessão ("admin") e assim exibir botão/action de Editar ou Desativar.
- [x] 4. Tela Detalhe do Cliente individual (AC 7)
  - [x] Criar Rota Dinâmica `/clientes/[id]/page.tsx`.
  - [x] Linkar do Grid principal a ID referenciada recuperando dados por `.eq(id)`.

## Notas do Dev
- **Debounce de Pesquisa**: Por ser uma listagem com pesquisa que atualiza conforme cada digitação as APIs de consulta, insira Delay (useDebounce) ou debounced-callback. 
- **Máscara/Validação de Telefones**: No PRD está vetado usos de código do país. Regule bem isso no Zod.
- **Soft Delete**: Caso ocorra exclusão, update em `activo`, alterando para bool falso. Evitar delete físico e sempre listar acrescentando `.eq('activo', true)` pra todos os usuários exceto pra Admin que quer checar tudo.

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
- O pacote `react-hook-form` e provedores de esquema Zod foram injetados corretamente.
- Modificado inteiramente `ClientesList.tsx` implementando o `<Sheet>` do Shadcn que abriga o `<Form>` com todos os campos controláveis e tratamento validatório para telefones c/10 dígitos obrigatórios.
- Exibição de Clientes individual implementada via `/clientes/[id]`, e reflete os registros dinâmicos e de banco (Inclusive Listando as Tiqueteras Ativas e inativas vinculadas a cada cliente).
- Políticas de banco confirmadas. Administradores podem atualizar e Operadores estão restritos.
- Listagem e Busca Otimizadas com Debounce funcional (buscando tanto em nombre, quanto em telefono_wsp).

### File List
- `src/app/clientes/ClientesList.tsx`
- `src/app/clientes/[id]/page.tsx`
- `package.json` (Dependências React-Hook-Form/Zod/Hookform Resolvers inseridas)
- Repositório de Componentes do Shadcn (Sheet, Form, Input Atualizados)

## QA Results
(Aguardando Agente de QA)
