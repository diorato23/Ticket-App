# Tech Stack — Tiquetera Linda Mariana

**Versión:** 1.0.0
**Fecha:** 2026-04-07
**Agente:** @architect (Aria)

---

## 1. Stack Tecnológico Seleccionado

### 1.1 Frontend y UI
| Tecnología | Versión | Propósito / Justificación |
|---|---|---|
| **Next.js** | 14/15 | Framework React base con enrutamiento de App Router (`app/`). |
| **React** | 18+ | Motor base para los componentes. |
| **TypeScript** | 5.3+ | Tipado estático (obligatorio). Previene errores de runtime con el modelo de DB. |
| **Tailwind CSS** | 3.4+ | Sistema de "Utility-First" CSS. Se extenderá con tokens de color de "Linda Mariana". |
| **Shadcn UI** | latest | Primitivos accesibles y componentes rápidos (Modales, Tablas, Inputs, Badges). |
| **Zustand** | 4+ | Manejo de estado global (ej. estado de la sesión, preferencias visuales, colas offline). |
| **Lucide-React** | latest | Paquete de íconos SVG moderno. |
| **Date-fns** | latest | Operaciones con fechas (crucial para cálculo de vencimientos). |

### 1.2 Backend e Infraestructura
| Tecnología | Versión | Propósito / Justificación |
|---|---|---|
| **Supabase (PostgreSQL)** | cloud | BaaS para persistencia relacional 100% en la nube. |
| **Supabase Auth** | cloud | Sistema de Login con JWT automático y validación contra RLS. |
| **VPS Propio** | Ubuntu/Node | Servidor personal donde se hará el build y alojamiento final del proyecto Next.js. |

### 1.3 Herramientas de Desarrollo y Calidad (CLI)
| Tecnología | Propósito / Justificación |
|---|---|
| **Pnpm** | Gestor de paquetes más rápido y ligero. |
| **Biome** / **ESLint** | Linter y formateador estricto para TS. |
| **Supabase CLI** | Mantener migraciones de base de datos en control de versiones en vez de crearlas por consola web. Generar tipos automáticos de TS `Database`. |

---

## 2. Decisiones Arquitectónicas Justificadas (ADR Overview)

### ADR 1: Supabase vs Firebase
**Decisión:** Supabase.
**Por qué:** El modelo de negocio requiere datos claramente relacionados (Usuario -> Cliente -> Tiquetera -> Marcación). Un modelo relacional clásico de PostgreSQL es superior y da reportes inmediatos y sólidos, al contrario que NoSQL.

### ADR 2: App Router en lugar de Pages Router (Next.js)
**Decisión:** Next.js App Router (`/app`).
**Por qué:** Es el estándar actual. Utilizar las acciones de servidor (`Server Actions`) simplifica llamar APIs y mutaciones sin necesitar un backend intermedio complejo de `/api` routes.

### ADR 3: Diseño Responsivo Extremo vs App Nativa
**Decisión:** Aplicación Web (PWA ready).
**Por qué:** El PRD especifica "Won't have app nativa". Una web responsiva accesible mediante envío de WhatsApp a los clientes tiene 0 barrera de entrada para ellos. Además evita lidiar con licencias de Apple/Google.

---

## 3. Configuración del Entorno de Color (Tailwind)

Se configurará el `tailwind.config.ts` adaptando los exigidos en el PRD:

```ts
// Ejemplo de la extensión de colores en Tailwind
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#F5A623', // Naranja Mariana
        dark: '#D4891A',
        light: '#FFF4E1',
      },
      secondary: {
        DEFAULT: '#1A1A1A', // Negro
      },
      surface: {
        DEFAULT: '#FAFAFA'
      }
    }
  }
}
```

---

_Creado por @architect (Aria) | Fecha: 2026-04-07 | Synkra AIOX_
