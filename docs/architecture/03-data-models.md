# Data Models (Supabase) — Tiquetera Linda Mariana

**Versión:** 1.0.0
**Fecha:** 2026-04-07
**Agente:** @architect (Aria)

---

## 1. Esquema Relacional de Base de Datos

La base de datos PostgreSQL de Supabase sigue la siguiente estructura central. 

**Consideraciones Clave:**
1. Haremos fuerte uso de las llaves foráneas (`REFERENCES`).
2. El acceso directo a los perfiles de Supabase Auth se hace habitualmente con una tabla paralela `profiles` o `usuarios` atada con un Trigger en Auth, pero para esta iteración, bastará con una tabla `usuarios`.
3. Todos los campos de fechas se guardan como `timestamptz` o `date` e interaccionarán usando estándar ISO 8601.

### 1.1 Diagrama DBML de Entidades

```dbml
Table usuarios {
  id uuid [pk, default: `gen_random_uuid()`] 
  auth_id uuid [ref: > auth.users.id, note: "Link a Supabase Auth"]
  nombre varchar(100) [not null]
  rol varchar(20) [not null, default: 'operador', note: "'admin' o 'operador'"]
  activo boolean [default: true]
  created_at timestamptz [default: `now()`]
}

Table clientes {
  id uuid [pk, default: `gen_random_uuid()`]
  nombre varchar(150) [not null]
  telefono_wsp varchar(20) [not null, note: "Ej: 3146713097"]
  notas text
  activo boolean [default: true]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

Table tiqueteras {
  id uuid [pk, default: `gen_random_uuid()`]
  cliente_id uuid [ref: > clientes.id]
  tipo int [not null, note: "15 o 30 (dias)"]
  precio int [not null, note: "150000 o 300000"]
  metodo_pago varchar(50) [not null, note: "'Efectivo', 'Nequi', 'Bancolombia'"]
  fecha_inicio date [not null, default: `current_date`]
  fecha_vencimiento date [not null, note: "fecha_inicio + tipo"]
  estado varchar(20) [not null, default: 'activa', note: "'activa', 'vencida', 'consumida'"]
  token_publico uuid [not null, default: `gen_random_uuid()`, unique]
  created_by uuid [ref: > usuarios.id]
  created_at timestamptz [default: `now()`]
}

Table marcaciones {
  id uuid [pk, default: `gen_random_uuid()`]
  tiquetera_id uuid [ref: > tiqueteras.id]
  fecha timestamptz [default: `now()`]
  desechable boolean [default: false]
  marcado_por uuid [ref: > usuarios.id]
  created_at timestamptz [default: `now()`]
}
```

---

## 2. Row Level Security (RLS) Policies

Para la seguridad (RLS), las políticas iniciales que se codificarán en Supabase:

### 2.1 Política para `clientes`, `tiqueteras` y `marcaciones` (Roles Auth)
- **Admin:** `SELECT`, `INSERT`, `UPDATE`, `DELETE` (ALL) para todas las tablas.
- **Operador:** 
  - `clientes`: `SELECT`, `INSERT` (crear clientes nuevos).
  - `tiqueteras`: `SELECT`, `INSERT` (vender tiqueteras). (No pueden editar ni eliminar).
  - `marcaciones`: `SELECT`, `INSERT`. (Marcar asistencia. No pueden borrar marcaciones por errores, debe hacerlo admin). 

### 2.2 Política para Consultas Públicas (El Cliente del Restaurante)
Dado que el Portal Público (Next.js Server Component) usará el JS Client de Supabase con Service Role de manera interna en Next.js (SSR), Next.js puede bypassar RLS si se configura así, pero lo ideal es:
- El Cliente final (usuario no logueado/anon) via Supabase Client Anon Key solo puede hacer un `SELECT` en `tiqueteras` y `marcaciones` donde el `token_publico` coincida explícitamente en la query a la de un URL exacto.
- **Política Anónima (tiqueteras):** `SELECT solo si token_publico = req.token_publico`.

---

## 3. Triggers / Automation de Base de Datos

Para que el estado se mantenga íntegro sin sobrecargar el Frontend o necesitar Cron jobs constantes:

1. **Trigger Atualizar Estado Tiquetera (Consumida):**
   *(Cuando se inserta en `marcaciones`)*
   - Verificar cuántas marcaciones existen para `NEW.tiquetera_id`.
   - Si `count(marcaciones) >= tiqueteras.tipo`, hacer `UPDATE tiqueteras SET estado = 'consumida' WHERE id = NEW.tiquetera_id`.

2. **Trigger Actualizar Estado Tiquetera (Vencida):**
   - Una "Edge Function" invocada periódicamente (Ej: Cron en Supabase) o una lógica a demanda cada vez que se pide la página, que revise: `UPDATE tiqueteras SET estado = 'vencida' WHERE fecha_vencimiento < CURRENT_DATE AND estado = 'activa'`.

---

_Creado por @architect (Aria) | Fecha: 2026-04-07 | Synkra AIOX_
