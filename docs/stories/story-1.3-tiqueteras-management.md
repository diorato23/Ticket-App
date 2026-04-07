# Story 1.3 — Gestión de Tiqueteras

## Objetivo
Implementar la gestión centralizada de tiqueteras (planes de almuerzos). Administrar creación, asociación a clientes e historial, asegurando reglas de negocio estrictas como validaciones de límites activos y métodos de pago.

## Dependencias
- [x] Story 1.1: Autenticación base y dashboard.
- [x] Story 1.2: CRUD de clientes (Base para asignar la tiquetera).

## Criterios de Aceptación (Acceptance Criteria)
1. **Modelado (AC 1):** Tabela `tiqueteras` debe existir com atributos completos (tipo, precio, fechas, etc.).
2. **Listado Principal (AC 2):** Vista dinámica `/tiqueteras` donde se observen todas las transacciones ordenadas con estados `activa`, `vencida`, `consumida`.
3. **Formulario de Creación (AC 3):** Modal/Sheet que permite escoger al cliente destino de una lista `Select`, su plan de 15 o 30 días, y su método de pago.
4. **Reglas de Negocio (AC 4):** No permitir generar nueva tiquetera `activa` a un cliente que *ya* posea una actualmente activa.
5. **Seguridad (AC 5):** Bloquear ediciones y eliminaciones para el rol `operador`, permitiendo lectura e insert.

## Tarefas / Subtarefas
- [ ] 1. Configuración DB y Migración `tiqueteras`
  - [ ] Verificar o crear la tabla `tiqueteras` en Supabase con los enums correspondientes y Row Level Security (RLS).
  - [ ] Añadir trigger o función de auto-vencimiento/consumo si es posible en DB-level.
- [ ] 2. Layout Frontend & Routing `/tiqueteras`
  - [ ] Crear la página de listado general de compras.
  - [ ] Componentizar `Badge` visual para estados (Ativa = Verde, Vencida = Vermelha, Consumida = Cinza).
- [ ] 3. Formularios con Zod & React-Hook-Form
  - [ ] Schema para `metodo_pago` y validaciones numéricas para `precio` y `tipo`.
  - [ ] Construir Select de buscar cliente (combobox o select nativo).
- [ ] 4. Testes integrados
  - [ ] Tentar burlar la creación doble de tiqueteras.
  
## Dev Agent Record
### Agent Model Used
(A ser preenchido pelo Agente Dev)

### Completion Notes List
(A ser preenchido pelo Agente Dev)

### File List
(A ser preenchido pelo Agente Dev)

## QA Results
(A ser preenchido pelo Agente de QA)
