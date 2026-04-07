# Story 1.4 — Marcación Diaria

## Objetivo
Implementar la interfaz principal de uso diario donde los operadores escanean o buscan a los clientes para marcar sus almuerzos. El flujo debe ser ultrarrápido y prevenir doble marcación no deseada.

## Dependencias
- [x] Story 1.3: Gestión de Tiqueteras (Base de datos y estructura de planes activos).

## Criterios de Aceptación (Acceptance Criteria)
1. **Búsqueda Instantánea (AC 1):** Barra central gigante que filtra clientes con *tiqueteras activas* por nombre o teléfono de manera responsiva.
2. **Confirmación Visual (AC 2):** Al seleccionar un usuario, emerge un Modal (Dialog) con el estado de la tiquetera actual y una opción de checkboc "Desechable (+$1.000)".
3. **Control Anti-Doble Marcación (AC 3):** Si el cliente ya fue marcado en la misma fecha local, el operador debe recibir una advertencia tipo "Ya consumió hoy. Autorizar segundo almuerzo?".
4. **Trigger Database (AC 4):** Si la marcación de hoy completa el cupo de días (ej: 15/15), el trigger en el Supabase debe cambiar la tiquetera respectiva automáticamente de estado `activa` a estado `consumida`.

## Tarefas / Subtarefas
- [ ] 1. Frontend: MarcacionClient
  - [ ] Interfaz limpa con input gigante de busca.
  - [ ] Debounce na busca para evitar sobrecarga.
- [ ] 2. Validações e Regras
  - [ ] Checar no momento do clique se o usuário já possui 1 registro de `marcaciones` do dia de hoje (em fuso de Bogotá local). Se tiver, abrir AlertDialog de aviso de "dupla marcação".
  - [ ] Campo checkbox "Desechable", caso ativado, salva a propriedade "desechable: true" na tabela `marcaciones`.
- [ ] 3. Feedback State
  - [ ] Ao marcar com sucesso, exibir uma animação / toast verde, e limpar a barra de pesquisa para que o operador faça o próximo pedido mais rápido.
  
## Dev Agent Record
### Agent Model Used
(A ser preenchido pelo Agente Dev)

### Completion Notes List
(A ser preenchido pelo Agente Dev)

### File List
(A ser preenchido pelo Agente Dev)

## QA Results
(A ser preenchido pelo Agente de QA)
