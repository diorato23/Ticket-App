# PRD — Tiquetera Linda Mariana

**Versión:** 1.0.0
**Fecha:** 2026-04-07
**Status:** Draft
**Agente:** @pm (Morgan)
**Basado en:** [Project Brief](../brief/project-brief.md)

---

## 1. Visión del Producto

### 1.1 Declaración de Visión

**Tiquetera Linda Mariana** es una plataforma web responsiva que digitaliza el sistema de tiqueteras (planes de almuerzos prepagados) del Linda Mariana Restaurante en Colombia, eliminando el control manual en cartones de papel y proporcionando a la dueña visibilidad total del negocio, mientras los clientes consultan sus planes desde el celular.

### 1.2 Declaración del Problema

| Aspecto | Descripción |
|---|---|
| **¿Quién?** | Mariana (dueña) + 3 operadores + ~65 clientes con tiquetera |
| **¿Qué problema?** | Control manual de tiqueteras en cartones naranjas sin trazabilidad, vulnerable a fraude y pérdida |
| **¿Impacto?** | Pérdida económica por fraude, imposibilidad de planificar, clientes pierden cartones, cero datos para decisiones |
| **¿Solución?** | Plataforma web que gestiona tiqueteras digitalmente con portal de consulta para clientes via WhatsApp |

### 1.3 Objetivos del Producto

| # | Objetivo | Indicador | Meta |
|---|---|---|---|
| O1 | Eliminar fraude | Casos de fraude reportados | 0 en el primer mes |
| O2 | Digitalizar 100% de marcaciones | % de marcaciones digitales vs. papel | 100% en semana 3 |
| O3 | Aumentar tasa de renovación | % de clientes que renuevan tiquetera | > 75% |
| O4 | Proveer datos accionables | Dashboard con métricas en tiempo real | Operativo en semana 2 |
| O5 | Facilitar crecimiento | Nuevos clientes/mes | +10% en mes 3 |

### 1.4 Público Objetivo

**Usuario primario:** Mariana (administradora) y 3 operadores
**Usuario secundario:** ~65 clientes con tiquetera (80% estudiantes universitarios)
**Mercado:** Restaurantes populares en Colombia con sistema de tiqueteras/planes prepagados

---

## 2. Alcance y Priorización (MoSCoW)

### 🔴 Must Have (MVP — Fase 1)

| ID | Feature | Descripción |
|---|---|---|
| F01 | **Autenticación y Roles** | Login para administrador y operadores (3 usuarios). Roles: Admin y Operador |
| F02 | **Gestión de Clientes** | CRUD de clientes: nombre, teléfono WhatsApp, notas. Búsqueda por nombre o teléfono |
| F03 | **Gestión de Tiqueteras** | Crear tiquetera 15 o 30 días. Fecha inicio/vencimiento auto. Estados: activa, vencida, consumida |
| F04 | **Marcación Diaria** | Registrar asistencia del cliente. Impedir doble marcación. Registro de desechable (+$1.000 COP) |
| F05 | **Vista del Cliente** | Portal público via link único (sin login). Barra de progreso, días restantes, fecha de vencimiento |
| F06 | **Dashboard Básico** | Almuerzos a servir hoy, tiqueteras por vencer, resumen financiero simple |

### 🟡 Should Have (Fase 2)

| ID | Feature | Descripción |
|---|---|---|
| F07 | **Notificaciones WhatsApp** | Alerta automática: 3 días antes de vencer, al vencer. Envío de link del portal |
| F08 | **Reportes Avanzados** | Ingresos por período, tasa de renovación, clientes más frecuentes, tendencias |
| F09 | **Log de Auditoría** | Registro de quién marcó qué, cuándo. Historial de acciones por operador |
| F10 | **Desechables (Control)** | Reporte separado de uso de recipientes desechables y cobro adicional |

### 🟢 Could Have (Fase 3)

| ID | Feature | Descripción |
|---|---|---|
| F11 | **Programa de Fidelidad** | Cada 3 tiqueteras de 30 días → 2 días extra gratis |
| F12 | **Sistema de Referidos** | Cliente indica amigo → ambos ganan 1 día extra |
| F13 | **QR Code por Cliente** | Código QR para marcación rápida en el restaurante |
| F14 | **PWA Offline** | Funcionalidad offline completa con sincronización automática |

### ⚪ Won't Have (Fuera del Alcance v1)

- Pasarela de pagos online automática (El pago por Nequi/Bancolombia se hace directo al negocio, en el sistema solo se **registra** el método)
- App nativa (Android/iOS)
- Multi-restaurante (la marca no maneja franquicias)
- Sistema propio de delivery (no se hacen entregas)
- Menú digital

---

## 3. Identidad Visual y Directrices de UI

### 3.1 Paleta de Colores (Basada en la Marca)

| Token | Color | Uso |
|---|---|---|
| `--color-primary` | `#F5A623` (Naranja/Ámbar) | Botones principales, acentos, header |
| `--color-primary-dark` | `#D4891A` | Hover states, bordes activos |
| `--color-primary-light` | `#FFF4E1` | Backgrounds sutiles, cards |
| `--color-secondary` | `#1A1A1A` (Negro) | Texto principal, títulos |
| `--color-text` | `#333333` | Texto de cuerpo |
| `--color-text-light` | `#666666` | Texto secundario |
| `--color-background` | `#FFFFFF` | Fondo principal |
| `--color-surface` | `#FAFAFA` | Fondo de cards |
| `--color-success` | `#4CAF50` | Marcación exitosa, tiquetera activa |
| `--color-warning` | `#FF9800` | Tiquetera por vencer |
| `--color-danger` | `#F44336` | Tiquetera vencida, errores |

### 3.2 Tipografía

| Uso | Fuente | Peso |
|---|---|---|
| Títulos | **Outfit** (Google Fonts) | 600-700 |
| Cuerpo | **Inter** (Google Fonts) | 400-500 |
| Números/datos | **Inter** tabular | 500-600 |

### 3.3 Mascota

La **chefcita** (mascota de Linda Mariana) debe aparecer como:
- Avatar en el header de la aplicación admin
- Ícono de bienvenida en el portal del cliente
- Elemento visual en estados vacíos (empty states)

---

## 4. Arquitectura de Información

### 4.1 Mapa del Sistema

```
Tiquetera Linda Mariana
│
├── 🔐 Panel Admin (Mariana + Operadores)
│   ├── /login                    → Autenticación
│   ├── /dashboard                → Vista general del día
│   ├── /clientes                 → Lista + búsqueda de clientes
│   │   └── /clientes/:id        → Detalle del cliente + historial
│   ├── /tiqueteras               → Gestión de tiqueteras
│   │   ├── /tiqueteras/nueva     → Crear nueva tiquetera
│   │   └── /tiqueteras/:id       → Detalle de tiquetera
│   ├── /marcacion                → Pantalla de marcación rápida
│   └── /reportes                 → Reportes y métricas (Fase 2)
│
└── 🌐 Portal Cliente (Público)
    └── /mi-tiquetera/:token      → Vista de tiquetera del cliente
```

### 4.2 Flujos Principales

#### Flujo 1: Marcación Diaria (Más Frecuente)

```
Operador abre /marcacion
    → Busca cliente por nombre
    → Selecciona cliente
    → Confirma marcación (✓ con/sin desechable)
    → Sistema registra: fecha, hora, operador, desechable
    → Feedback visual: "✅ Marcado — Día 18/30"
```

#### Flujo 2: Crear Tiquetera

```
Admin abre /tiqueteras/nueva
    → Selecciona cliente (o crea nuevo)
    → Elige plan: 15 días ($150.000) o 30 días ($300.000)
    → Selecciona método de pago: Efectivo, Nequi o Bancolombia
    → Define fecha inicio (default: hoy)
    → Sistema calcula vencimiento
    → Confirma creación
    → Sistema genera link único del portal
    → Opción: "Enviar link por WhatsApp"
```

#### Flujo 3: Cliente Consulta su Tiquetera

```
Cliente recibe link por WhatsApp
    → Abre en navegador del celular
    → Ve: nombre, plan, progreso visual
    → Ve: días usados / total, fecha vencimiento
    → Botón: "Renovar" (abre WhatsApp con mensaje pre-llenado)
```

---

## 5. Modelo de Datos (Conceptual)

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Usuario    │     │    Cliente       │     │   Tiquetera      │
├──────────────┤     ├──────────────────┤     ├──────────────────┤
│ id           │     │ id               │     │ id               │
│ nombre       │     │ nombre           │     │ cliente_id  (FK) │
│ email        │     │ telefono_wsp     │     │ tipo (15|30)     │
│ password     │     │ notas            │     │ precio           │
│ rol (admin|  │     │ activo           │     │ fecha_inicio     │
│   operador)  │     │ created_at       │     │ fecha_vencimiento│
│ created_at   │     │ updated_at       │     │ estado (activa|  │
└──────────────┘     └──────────────────┘     │   vencida|       │
                             │                │   consumida)     │
                             │                │ token_publico    │
                             │                │ created_by (FK)  │
                             │                │ created_at       │
                             │                └──────────────────┘
                             │                        │
                             │                        │
                      ┌──────────────────┐     ┌──────────────────┐
                      │    Marcación     │     │
                      ├──────────────────┤
                      │ id               │
                      │ tiquetera_id(FK) │
                      │ fecha            │
                      │ desechable (bool)│
                      │ marcado_por (FK) │
                      │ created_at       │
                      └──────────────────┘
```

---

## 6. Requisitos No Funcionales

| Categoría | Requisito | Prioridad |
|---|---|---|
| **Rendimiento** | Marcación en < 3 segundos | Must |
| **Disponibilidad** | 99.5% uptime | Must |
| **Seguridad** | Tokens de cliente no adivinables (UUID v4 + hash) | Must |
| **Seguridad** | Autenticación con hash bcrypt para operadores | Must |
| **Escalabilidad** | Hasta 500 clientes activos | Should |
| **Responsive** | Mobile-first, funcional en Android 8+ | Must |
| **Idioma** | Español colombiano | Must |
| **Moneda** | COP sin decimales (separador de miles: punto) | Must |
| **Offline** | Queue de marcaciones offline (Fase 3) | Could |
| **Accesibilidad** | Contraste AA mínimo, fuentes legibles | Should |

---

## 7. Criterios de Aceptación Globales

### Para el MVP (Fase 1):

- [ ] Mariana puede hacer login y ver el dashboard con almuerzos del día
- [ ] Operador puede buscar un cliente y marcar asistencia en < 10 segundos
- [ ] Sistema impide marcar el mismo cliente 2 veces en el mismo día
- [ ] Tiquetera muestra correctamente "activa", "vencida" o "consumida"
- [ ] Cliente accede a su portal via link y ve su progreso visual
- [ ] Dashboard muestra: almuerzos hoy, tiqueteras por vencer (3 días), ingreso del mes
- [ ] UI utiliza la paleta naranja de la marca Linda Mariana
- [ ] Funcional en celular Android con Chrome

---

## 8. Fases de Entrega

### Fase 1 — MVP (2-3 semanas)
**Objetivo:** Sustituir los cartones naranjas
- F01: Autenticación y Roles
- F02: Gestión de Clientes
- F03: Gestión de Tiqueteras
- F04: Marcación Diaria
- F05: Vista del Cliente
- F06: Dashboard Básico

### Fase 2 — Valor Agregado (2 semanas)
**Objetivo:** Automatización y datos
- F07: Notificaciones WhatsApp
- F08: Reportes Avanzados
- F09: Log de Auditoría
- F10: Control de Desechables

### Fase 3 — Crecimiento (2 semanas)
**Objetivo:** Fidelización y optimización
- F11: Programa de Fidelidad
- F12: Sistema de Referidos
- F13: QR Code
- F14: PWA Offline

---

## 9. Riesgos y Mitigaciones

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | Operadores no adoptan el sistema | Media | Alto | UI de marcación extremamente simple (< 3 toques) |
| R2 | Conexión inestable en el restaurante | Media | Alto | Queue offline para marcaciones (Fase 3) |
| R3 | Clientes no entienden el link | Baja | Bajo | El portal es bonus; la operación no depende de él |
| R4 | Pérdida de datos | Baja | Alto | Backups automáticos diarios en Supabase |
| R5 | Crecimiento rápido sobrecarga el sistema | Baja | Medio | Arquitectura serverless desde el inicio |

---

## 10. Próximos Pasos

| Paso | Responsable | Output |
|---|---|---|
| Diseñar arquitectura técnica | @architect | `docs/architecture/` |
| Fragmentar en stories | @sm | `docs/stories/` |
| Implementar MVP | @dev | Código fuente |
| Validar e testar | @qa | Tests automatizados |

---

_Creado por @pm (Morgan) | Fecha: 2026-04-07 | Synkra AIOX_
— Morgan, planejando o futuro 📊
