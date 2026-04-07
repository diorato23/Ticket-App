# Requisitos y Métricas — Tiquetera Linda Mariana

**Versión:** 1.0.0
**Fecha:** 2026-04-07
**Agente:** @pm (Morgan)

---

## 1. Requisitos Técnicos

### 1.1 Stack Tecnológico (Recomendado)

| Capa | Tecnología | Justificación |
|---|---|---|
| **Frontend** | Next.js 16 + React + TypeScript | SSR para portal cliente, SPA para admin |
| **Estilos** | Tailwind CSS + Design Tokens de la marca | Rapidez de desarrollo, responsive nativo |
| **Backend/API** | Supabase (PostgreSQL + Auth + Realtime) | BaaS completo, sin servidor propio, gratis para este volumen |
| **Autenticación** | Supabase Auth (email/password) | Integrado, seguro, sin configuración extra |
| **Hosting** | VPS Propio (Self-hosted) | Deploy que se ejecutará en la fase final del proyecto |
| **Notificaciones** | Twilio WhatsApp API (Fase 2) | API confiable para Colombia |

### 1.2 Justificación de Supabase

| Beneficio | Detalle |
|---|---|
| **Costo** | Gratis hasta 500MB DB + 50K auth users + 5GB bandwidth |
| **Auth integrado** | Login con roles listo para usar |
| **Realtime** | Dashboard se actualiza automáticamente cuando operador marca |
| **RLS** | Seguridad a nivel de fila para tokens de clientes |
| **PostgreSQL** | Queries SQL reales para reportes |

### 1.3 Requisitos de Infraestructura

| Recurso | Estimación |
|---|---|
| **Base de datos** | Supabase Cloud (100% en la nube). **Beneficio:** Todos los datos están respaldados en la nube. Si un celular se daña, pierde o falla la app, **no se pierde nada de información**. |
| **Tamaño BD** | < 100MB (65 clientes × 12 tiqueteras/año × 30 marcaciones) |
| **Bandwidth** | < 2GB/mes (3 operadores + 65 visitas de portal) |
| **Storage** | Mínimo (sin imágenes — solo datos textuales) |
| **Dominio** | `tiquetera-lindamariana.com` o similar |

---

## 2. Requisitos de Seguridad

| # | Requisito | Implementación |
|---|---|---|
| S1 | Contraseñas hasheadas | bcrypt via Supabase Auth |
| S2 | Tokens de portal no adivinables | UUID v4 (36 chars) |
| S3 | HTTPS obligatorio | Configuración SSL en Nginx/Certbot en la VPS |
| S4 | RLS en base de datos | Políticas Supabase por rol |
| S5 | Rate limiting en portal | Máx. 60 req/min por IP |
| S6 | No exponer datos sensibles en portal | Solo nombre, progreso, fechas |

---

## 3. Requisitos de Rendimiento

| Métrica | Target | Medición |
|---|---|---|
| **First Contentful Paint (Portal)** | < 1.5s | Lighthouse en 3G |
| **Time to Interactive (Admin)** | < 3s | Lighthouse en WiFi |
| **Tiempo de marcación** | < 3s total | Desde búsqueda hasta confirmación |
| **Búsqueda de clientes** | < 500ms | Filtrado frontend con 500 clientes |
| **Dashboard load** | < 2s | Queries optimizadas con índices |

---

## 4. Métricas de Éxito del Producto

### 4.1 KPIs del Negocio

| KPI | Línea Base | Meta Mes 1 | Meta Mes 3 |
|---|---|---|---|
| **Clientes con tiquetera** | 65 | 65 (mantener) | 72+ (+10%) |
| **Tasa de renovación** | Desconocida | > 65% | > 75% |
| **Fraudes reportados** | Desconocido | 0 | 0 |
| **Ingreso mensual tiqueteras** | ~$19.5M COP | $19.5M+ | $21.5M+ |

### 4.2 KPIs del Producto

| KPI | Meta |
|---|---|
| **Adopción digital** | 100% marcaciones digitales en semana 3 |
| **Tiempo de marcación** | < 10 segundos por cliente |
| **Uptime** | 99.5% |
| **Portal: visitas únicas** | > 30% de clientes acceden al link |
| **Renovación via WhatsApp** | > 20% de renovaciones por el botón del portal |

### 4.3 KPIs de Satisfacción

| KPI | Método | Meta |
|---|---|---|
| **Satisfacción de Mariana** | Feedback directo | "No quiero volver al papel" |
| **Satisfacción operadores** | Observación de uso | Operan sin pedir ayuda |
| **Satisfacción clientes** | Acceso al portal | > 50% abren el link al menos 1 vez |

---

## 5. Plan de Lanzamiento

### Semana 0: Pre-lanzamiento
- [ ] Registrar clientes actuales en el sistema (65 clientes)
- [ ] Crear tiqueteras activas existentes
- [ ] Entrenar Mariana y operadores (30 min)
- [ ] Período de prueba: 2 días con cartón + digital en paralelo

### Semana 1: Lanzamiento Suave
- [ ] Operadores usan solo el sistema digital para marcar
- [ ] Cartones se mantienen como backup visual para clientes
- [ ] Monitorear errores y feedback diario

### Semana 2: Lanzamiento Completo
- [ ] Eliminar cartones de papel
- [ ] Enviar links de portal a todos los clientes por WhatsApp
- [ ] Dashboard activo con datos reales

### Semana 3+: Estabilización
- [ ] Resolver issues reportados
- [ ] Medir KPIs de adopción
- [ ] Planificar Fase 2

---

## 6. Glosario

| Término | Definición |
|---|---|
| **Tiquetera** | Plan prepagado de almuerzos (15 o 30 días) |
| **Marcación** | Registro de que el cliente usó su almuerzo del día |
| **Desechable** | Recipiente para llevar (+$1.000 COP adicional) |
| **Portal** | Página pública donde el cliente ve su tiquetera |
| **Token** | Código único e irrepetible que identifica la tiquetera del cliente en el portal |
| **Admin** | Mariana (dueña), con acceso total al sistema |
| **Operador** | Empleado con acceso a marcación y consulta |
| **COP** | Peso colombiano (moneda) |
| **LM** | Linda Mariana (sigla del restaurante) |

---

_Creado por @pm (Morgan) | Fecha: 2026-04-07 | Synkra AIOX_
— Morgan, planejando o futuro 📊
