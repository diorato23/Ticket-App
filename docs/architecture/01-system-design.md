# System Design — Tiquetera Linda Mariana

**Versión:** 1.0.0
**Fecha:** 2026-04-07
**Agente:** @architect (Aria)

---

## 1. Visión General de la Arquitectura

El sistema `Tiquetera Linda Mariana` sigue un patrón moderno **Serverless "BaaS" (Backend as a Service)** impulsado por Supabase, con una capa visual responsiva servida mediante Next.js. Este enfoque nos permite desarrollar rápidamente, escalar sin infraestructura propia y mantener un coste cero/mínimo durante los periodos de validación del MV.

```mermaid
graph TD
    %% Clientes / Dispositivos
    ClientMobile[📱 Celular Cliente<br>(Portal Público WhatsApp)]
    AdminDesktop[💻 Admin/Operador<br>(Panel de Control)]
    
    %% Aplicación Frontend (VPS)
    subgraph Frontend [Next.js App / VPS Propio]
        UI[Componentes React / Tailwind]
        Zustand[Zustand State]
        SupabaseJS[Supabase Client]
    end

    %% Backend (Supabase)
    subgraph Backend [Supabase Cloud]
        Auth[🔒 Supabase Auth]
        DB[(🐘 PostgreSQL)]
        RLS[🛡️ Row Level Security]
        EdgeFunc[⚡ Edge Functions (Fase 2)]
    end
    
    %% Conexiones
    ClientMobile -->|HTTP/GET via token| Frontend
    AdminDesktop -->|HTTP/POST /login| Frontend
    
    UI <--> Zustand
    UI <--> SupabaseJS
    
    SupabaseJS <-->|JWT / WSS| Auth
    SupabaseJS <-->|PostgREST| DB
    Auth --> RLS
    DB --> RLS
```

---

## 2. Componentes Principales

### 2.1 Next.js (Visualización y Lógica)
Se usa Next.js (App Router) alojado en tu **VPS Propio** (El deploy será la fase final). Responsabilidades:
- **Client Components (CSR):** La mayoría de las interacciones del panel de administrador que requieren mucha velocidad (búsqueda en tiempo real).
- **Server Components (SSR/SSG):** Pantalla pública del cliente (Link generado). Se rinde de lado del servidor usando el `token` asegurando que en dispositivos móviles de gama baja cargue inmediatamente.
- **Rutas API:** Se minimizan. Las mutaciones y queries de la Base de datos se hacen directamente contra Supabase con el cliente de JS y las reglas de RLS.

### 2.2 Supabase (Persistencia y Control de Acceso)
Alojado en la nube.
- **PostgreSQL:** Tablas relacionales con llaves foráneas.
- **Supabase Auth:** Manejo nativo de sesiones por Email y Contraseña (para Mariana y los Operadores).
- **Row Level Security (RLS):** Las reglas de escritura/lectura están en la base de datos, lo que blinda al sistema. Por ejemplo: El portal público solo tiene acceso `SELECT` en la tabla maestra basado en coincidencia con su `token_publico`.

---

## 3. Patrones de Diseño (Frontend)

1. **Service-Layer para APIs (Supabase Client):** Las llamadas a base de datos están abstraídas en funciones como `createTiquetera()`, `marcarAsistencia()`, para desvincularlas de los componentes React.
2. **Context / Store (Zustand):** Usaremos Zustand para estado global sencillo (como el usuario autenticado, roles o configuración de UI). El resto del estado proveniente de base de datos se maneja vía React Query o SWR si aplica (o simples effect wrappers).
3. **Atomic Design modificado:** Componentes divididos en `ui` (elementos primitivos tipo Tailwind/Shadcn), `components` (ensamblados de UI) y `modules` (bloques enteros de negocio, ej. `BuscadorClientes`).

---

## 4. Estrategia de Acceso Offline (Fase 3)

Como el PRD mencionó una inestabilidad de red potencial en el restaurante:
- **Estrategia (Optimistic UI):** La acción de `Marcar Asistencia` cambiará el estado de forma inmediata visualmente (como éxito).
- **Service Worker / PWA:** Almacena la marcación en caché usando un Queue local (Zustand + IndexedDB) si la query contra Supabase falla o si `navigator.onLine` es `false`.
- Posteriormente, cuando la aplicación recobra la red, procesa la cola de marcaciones pendientes.

---

_Creado por @architect (Aria) | Fecha: 2026-04-07 | Synkra AIOX_
