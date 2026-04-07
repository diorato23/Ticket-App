# Features Detalladas — Tiquetera Linda Mariana

**Versión:** 1.0.0
**Fecha:** 2026-04-07
**Agente:** @pm (Morgan)

---

## F01 — Autenticación y Roles

### Descripción
Sistema de login para que Mariana (admin) y sus operadores accedan al panel de gestión.

### Especificación

| Aspecto | Detalle |
|---|---|
| **Método** | Email + contraseña |
| **Roles** | `admin` (Mariana) — acceso total · `operador` — marcación + consulta |
| **Sesión** | Persistente (auto-login por 30 días con token refresh) |
| **Límite** | Máximo 3 usuarios simultáneos |

### Permisos por Rol

| Funcionalidad | Admin | Operador |
|---|---|---|
| Dashboard | ✅ Completo | ✅ Solo vista diaria |
| Crear clientes | ✅ | ✅ |
| Editar clientes | ✅ | ❌ |
| Eliminar clientes | ✅ | ❌ |
| Crear tiqueteras | ✅ | ✅ |
| Cancelar tiqueteras | ✅ | ❌ |
| Marcar asistencia | ✅ | ✅ |
| Reportes | ✅ | ❌ |
| Gestionar usuarios | ✅ | ❌ |

### Criterios de Aceptación
- [ ] Admin puede hacer login con email y contraseña
- [ ] Operador puede hacer login con email y contraseña
- [ ] Sesión persiste al cerrar el navegador (30 días)
- [ ] Roles restringen funcionalidades correctamente
- [ ] Password hasheado con bcrypt (nunca almacenado en texto plano)

---

## F02 — Gestión de Clientes

### Descripción
CRUD completo de clientes del restaurante con búsqueda rápida.

### Campos del Cliente

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| `nombre` | string | ✅ | Min 2 caracteres |
| `telefono_wsp` | string | ✅ | Formato colombiano (10 dígitos, sin +57) |
| `notas` | text | ❌ | Max 500 caracteres |
| `activo` | boolean | Auto | Default: true |

### Funcionalidades
- **Listado** con búsqueda en tiempo real (por nombre o teléfono)
- **Crear** cliente nuevo (inline o modal)
- **Editar** datos (solo admin)
- **Desactivar** cliente (soft delete, solo admin)
- **Detalle** del cliente con historial de tiqueteras

### Criterios de Aceptación
- [ ] Buscar cliente por nombre muestra resultados en < 1 segundo
- [ ] Buscar por teléfono parcial funciona (ej: "714" encuentra "3146713097")
- [ ] Crear cliente con nombre duplicado muestra advertencia
- [ ] Desactivar cliente no elimina datos históricos
- [ ] Lista muestra badge con estado de tiquetera activa (si tiene)

---

## F03 — Gestión de Tiqueteras

### Descripción
Crear y administrar tiqueteras (planes de almuerzos prepagados) de 15 o 30 días.

### Tipos de Tiquetera

| Tipo | Días | Precio | Precio/día |
|---|---|---|---|
| **Media** | 15 | $150.000 COP | $10.000 |
| **Completa** | 30 | $300.000 COP | $10.000 |

### Campos de la Tiquetera

| Campo | Tipo | Descripción |
|---|---|---|
| `cliente_id` | FK | Cliente asociado |
| `tipo` | enum | `15` o `30` |
| `precio` | integer | Valor en COP |
| `metodo_pago`| enum | `Efectivo`, `Nequi` o `Bancolombia` |
| `fecha_inicio` | date | Cuándo inicia (default: hoy) |
| `fecha_vencimiento` | date | Auto-calculada: inicio + tipo días |
| `estado` | enum | `activa`, `vencida`, `consumida` |
| `token_publico` | string | UUID para acceso del cliente (portal) |
| `dias_usados` | computed | Count de marcaciones |
| `dias_restantes` | computed | tipo - dias_usados |

### Estados y Transiciones

```
                  crear
                    │
                    ▼
              ┌─────────┐
              │  ACTIVA  │
              └────┬─────┘
                   │
          ┌────────┼────────┐
          │                 │
   todos los días     fecha > vencimiento
     marcados               │
          │                 ▼
          ▼           ┌──────────┐
    ┌───────────┐     │ VENCIDA  │
    │ CONSUMIDA │     └──────────┘
    └───────────┘
```

### Reglas de Negocio
1. Un cliente puede tener máximo **1 tiquetera activa** a la vez
2. Si la tiquetera actual tiene ≤ 3 días restantes, se puede crear una nueva (empieza al día siguiente del vencimiento)
3. Si una tiquetera vence con días sin usar, esos días se **pierden** (no se transfieren)
4. El token público es generado automáticamente y es único

### Criterios de Aceptación
- [ ] Crear tiquetera de 15 días calcula correctamente fecha de vencimiento
- [ ] Crear tiquetera de 30 días calcula correctamente fecha de vencimiento
- [ ] Sistema impide crear segunda tiquetera activa para el mismo cliente
- [ ] Estado cambia automáticamente a "vencida" cuando pasa la fecha
- [ ] Estado cambia a "consumida" cuando todos los días están marcados
- [ ] Token público generado es UUID v4 (no adivinable)

---

## F04 — Marcación Diaria

### Descripción
Pantalla principal de operación diaria: marcar que un cliente usó su almuerzo.

### Flujo de Marcación

```
1. Operador abre /marcacion
2. Campo de búsqueda enfocado automáticamente
3. Digita nombre o parte del teléfono
4. Resultados filtrados en tiempo real (solo clientes con tiquetera activa)
5. Toca en el cliente
6. Muestra confirmación:
   ┌─────────────────────────────────┐
   │  Juan Pérez                     │
   │  Tiquetera 30 días              │
   │  Día 18 de 30                   │
   │                                 │
   │  ☐ Desechable (+$1.000)         │
   │                                 │
   │  [ ✅ Marcar Asistencia ]       │
   └─────────────────────────────────┘
7. Confirma → feedback visual "✅ Marcado"
8. Campo de búsqueda se limpia para siguiente marcación
```

### Reglas de Negocio
1. **Múltiples marcaciones por día permitidas** — El cliente puede gastar más de un almuerzo al día si así lo desea. Si ya fue marcado hoy, el operador verá una confirmación de advertencia: *"El cliente ya consumió un almuerzo hoy. ¿Autoriza marcar otro adicional?"* — Es responsabilidad del cliente que pide usar más de su plan.
2. **Visibilidad de tiqueteras (Control Admin vs Operador)** — Los operadores (empleados) solo ven tiqueteras activas en la búsqueda para prevenir errores. La **Administradora (Mariana) tiene control total** y puede buscar, ver y gestionar tiqueteras en cualquier estado (incluso vencidas) a través del sistema.
3. **Desechable es opcional** — Checkbox para registrar uso de recipiente (+$1.000)
4. **Registro de operador** — Cada marcación registra quién la hizo

### Criterios de Aceptación
- [ ] Búsqueda a nivel operador muestra solo tiqueteras activas, pero el Admin puede ver todas
- [ ] Marcación exitosa muestra feedback visual inmediato
- [ ] Intentar marcar cliente por segunda vez el mismo día muestra modal de advertencia que el operador debe confirmar
- [ ] Checkbox de desechable es opcional y registra el cargo adicional
- [ ] Después de marcar, el campo de búsqueda se limpia automáticamente
- [ ] Toda la operación se completa en ≤ 3 toques (buscar → seleccionar → confirmar)

---

## F05 — Vista del Cliente (Portal Público)

### Descripción
Página pública accesible via link único (sin login) donde el cliente ve el estado de su tiquetera.

### URL del Portal
```
https://tiquetera-lindamariana.com/mi-tiquetera/{token}
```

### Diseño Mobile-First

```
┌────────────────────────────────────┐
│  🍽️ Linda Mariana Restaurante      │
│  [mascota chefcita]                │
│                                    │
│  ¡Hola, Juan! 👋                   │
│                                    │
│  Tu tiquetera de 30 días           │
│  ████████████░░░░░   22/30 usados  │
│                                    │
│  📅 Inicio: 10 de marzo            │
│  ⏰ Vence: 9 de abril              │
│  🍽️ Quedan: 8 almuerzos            │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  📱 Renovar por WhatsApp     │  │
│  └──────────────────────────────┘  │
│                                    │
│  Linda Mariana Restaurante ❤️      │
│  Tel: 3146713097                   │
└────────────────────────────────────┘
```

### Reglas
1. **Sin login** — El token en la URL es la autenticación
2. **Read-only** — El cliente solo consulta, no puede modificar nada
3. **Botón renovar** — Abre WhatsApp con mensaje pre-llenado: `"Hola Linda Mariana! Quiero renovar mi tiquetera de {tipo} días. Mi nombre es {nombre}."`
4. **Responsive** — Optimizado para celulares Android con Chrome
5. **Branding** — Usa colores naranja de la marca + mascota

### Criterios de Aceptación
- [ ] Link con token válido muestra dashboard del cliente
- [ ] Link con token inválido muestra página elegante de "no encontrado"
- [ ] Barra de progreso actualiza en tiempo real (sin cache)
- [ ] Botón "Renovar" abre WhatsApp con mensaje correcto pre-llenado
- [ ] Página carga en < 2 segundos en 3G
- [ ] Diseño muestra correctamente en pantallas de 360px ancho

---

## F06 — Dashboard Administrativo

### Descripción
Vista principal al hacer login. Muestra el estado diario del restaurante.

### Widgets del Dashboard

| Widget | Descripción | Dato |
|---|---|---|
| **Almuerzos Hoy** | Cuántos servir (tiqueteras activas) | Número grande + tendencia |
| **Marcados Hoy** | Cuántos ya llegaron | Número + % del total |
| **Por Vencer** | Tiqueteras que vencen en 3 días | Lista con nombres |
| **Clientes Activos** | Total de tiqueteras activas | Número |
| **Ingreso del Mes** | Suma de tiqueteras creadas este mes | Valor en COP |
| **Desechables Hoy** | Recipientes usados hoy | Número + valor |

### Criterios de Aceptación
- [ ] Dashboard carga al hacer login (landing page)
- [ ] "Almuerzos Hoy" muestra el conteo correcto de tiqueteras activas
- [ ] "Marcados Hoy" actualiza en tiempo real cuando un operador marca
- [ ] "Por Vencer" muestra tiqueteras con ≤ 3 días restantes
- [ ] "Ingreso del Mes" calcula correctamente la suma

---

_Creado por @pm (Morgan) | Fecha: 2026-04-07 | Synkra AIOX_
— Morgan, planejando o futuro 📊
