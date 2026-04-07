# Project Brief: Tiquetera Linda Mariana

**Versión:** 1.0.0
**Fecha:** 2026-04-07
**Status:** Draft
**Agente:** @analyst (Atlas)
**Idioma del Sistema:** Español (Colombia)

---

## Tabla de Contenido

- [Resumen Ejecutivo](#resumen-ejecutivo)
- [Contexto del Negocio](#contexto-del-negocio)
- [Problema Actual](#problema-actual)
- [Visión del Producto](#visión-del-producto)
- [Público Objetivo](#público-objetivo)
- [Datos Financieros](#datos-financieros)
- [Requisitos Funcionales](#requisitos-funcionales)
- [Requisitos No Funcionales](#requisitos-no-funcionales)
- [Riesgos y Mitigaciones](#riesgos-y-mitigaciones)
- [Métricas de Éxito](#métricas-de-éxito)
- [Próximos Pasos](#próximos-pasos)

---

## Resumen Ejecutivo

**Tiquetera Linda Mariana** es un sistema web responsivo para la gestión digital de tiqueteras de comida (planes de almuerzos prepagados) del **Linda Mariana Restaurante**, ubicado en Colombia. El sistema reemplaza el actual control manual en cartones naranjas por una plataforma digital que permite a la dueña y sus operadores gestionar clientes, tiqueteras y presencia diaria, mientras los clientes consultan el estado de sus planes desde el celular vía un enlace de WhatsApp.

**Nombre del proyecto:** Tiquetera Linda Mariana
**Nombre del restaurante:** Linda Mariana Restaurante
**Tipo:** Aplicación Web Responsiva (PWA-ready)
**Mercado:** Colombia — sector gastronómico / restaurantes populares
**Modelo de negocio:** Planes de alimentación prepagados (15 y 30 días)

---

## Contexto del Negocio

### Linda Mariana Restaurante

| Aspecto | Detalle |
|---|---|
| **Nombre completo** | Linda Mariana Restaurante |
| **Sigla/Abreviación** | LM (Linda Mariana) |
| **Ubicación** | Colombia |
| **Segmento** | Restaurante popular / almuerzo ejecutivo |
| **Clientes principales** | Estudiantes universitarios (~80%) y público general |
| **Diferencial** | Planes de tiquetera con descuento vs. precio individual |
| **Teléfono/WhatsApp** | 3146713097 |
| **Visión** | Crecer el negocio |

### Identidad Visual de la Marca

| Elemento | Descripción |
|---|---|
| **Logo** | Circular con borde tipo pincelada naranja/ámbar |
| **Tipografía principal** | "Linda" en letra script/cursiva negra elegante |
| **Tipografía secundaria** | "Mariana" en letra cursiva color naranja/dorado suave |
| **Tipografía terciaria** | "restaurante" en minúsculas, estilo sans-serif naranja |
| **Mascota** | Chefcita (niña morena con gorro de chef blanco, delantal rojo, sosteniendo una bandeja de servir) |
| **Color primario** | Naranja/Ámbar (#F5A623 aprox.) |
| **Color secundario** | Negro (tipografía script) |
| **Color de fondo** | Blanco |
| **Estilo visual** | Cálido, cercano, artesanal, femenino |

**Directrices de diseño para el sistema digital:**
- La paleta de colores del sistema debe respetar los colores de la marca: naranja como color principal, negro para texto, blanco para fondos
- La mascota (chefcita) puede usarse como avatar/ícono en la interfaz
- El estilo debe ser **cálido y accesible**, reflejando la calidez del restaurante
- Evitar colores fríos (azul, verde) como colores principales — usar naranja/ámbar como identidad

### Sistema Actual (Analógico)

El restaurante utiliza **cartones (tarjetas naranjas)** impresos con:
- Logo "LM" (Linda Mariana) y número de teléfono
- 30 casillas numeradas (1-15 lado izquierdo, 16-30 lado derecho)
- Marcación manual con risco diagonal (✗) y fecha al lado
- Sin identificación del cliente en el cartón
- Control 100% manual con bolígrafo

```
┌───────────────────────────────────────┐
│  LM          3146713097               │
│  1  ✗4/2    16  13/2                  │
│  2  ✗5/2    17  16/02                 │
│  3  ✗5/2    18  16/02                 │
│  4  ___     19  ✗                     │
│  5  ✗6/2    20  17-02                 │
│  ...        ...                       │
│  15 ___     30  ___                   │
└───────────────────────────────────────┘
```

---

## Problema Actual

### Problemas Identificados

| # | Problema | Impacto | Severidad |
|---|---|---|---|
| 1 | **Sin trazabilidad** — No hay registro digital de quién tiene tiquetera | No se sabe cuántos almuerzos servir por día | 🔴 Alta |
| 2 | **Fraude potencial** — Cartones pueden ser fotocopiados | Pérdida económica directa | 🔴 Alta |
| 3 | **Pérdida de cartón** — Cliente pierde su tarjeta y no hay respaldo | Conflicto comercial, pérdida de confianza | 🟡 Media |
| 4 | **Cero reportes** — Sin datos de ingresos, vencimientos ni tendencias | Imposible planificar crecimiento | 🟡 Media |
| 5 | **Renovación reactiva** — No hay alerta cuando la tiquetera está por vencer | Clientes olvidan renovar, se pierde recurrencia | 🟡 Media |
| 6 | **Gestión descentralizada** — Solo quien tiene el cartón sabe el estado | Los 3 operadores no tienen visión compartida | 🟡 Media |

### Oportunidades Perdidas

- No hay **programa de fidelización** (el cliente lleva años y nunca recibe beneficio extra)
- No hay **indicación/referidos** (el boca a boca no se incentiva)
- No hay **datos para decisiones** (no sabe qué día tiene más demanda, cuál es la tasa de renovación)

---

## Visión del Producto

### Declaración de Visión

> Transformar el sistema de tiqueteras en papel de **Linda Mariana Restaurante** en una plataforma digital ágil que: **elimine el fraude**, **automatice el control de asistencia**, **empodere a los clientes** con visibilidad de sus planes, y **entregue datos accionables** para el crecimiento del negocio — manteniendo la identidad visual cálida de la marca (naranja, mascota chefcita).

### Principios de Diseño

1. **Simplicidad extrema** — Mariana y sus empleados deben operar sin capacitación técnica
2. **Mobile-first** — Todo se opera y consulta desde celulares
3. **WhatsApp-centric** — Canal principal de comunicación con clientes (uso masivo en Colombia)
4. **Sin fricción para el cliente** — Acceso via link, sin descargar app, sin crear cuenta
5. **Offline-resilient** — Marcar presencia debe funcionar aunque la conexión sea inestable

---

## Público Objetivo

### Usuarios del Sistema

#### 1. Mariana (Administradora)
| Aspecto | Detalle |
|---|---|
| **Rol** | Dueña del restaurante, decisora principal |
| **Necesidad** | Control total del negocio, reportes, gestión de clientes |
| **Habilidad tech** | Básica-intermedia (usa WhatsApp, redes sociales) |
| **Dispositivo** | Celular Android / computador básico |

#### 2. Operadores (3 usuarios)
| Aspecto | Detalle |
|---|---|
| **Rol** | Empleados que atienden y marcan asistencia |
| **Necesidad** | Marcar rápidamente la presencia diaria del cliente |
| **Habilidad tech** | Básica |
| **Dispositivo** | Celular Android |

#### 3. Clientes (65+ activos)
| Aspecto | Detalle |
|---|---|
| **Perfil principal** | Estudiantes universitarios (~80%) |
| **Perfil secundario** | Trabajadores y personas del sector |
| **Necesidad** | Ver cuántos días les quedan, saber cuándo vence |
| **Habilidad tech** | Alta (jóvenes, nativos digitales) |
| **Dispositivo** | Celular Android (predominante en Colombia) |

---

## Datos Financieros

### Estructura de Precios

| Producto | Precio (COP) | Precio/día | Ahorro vs. Individual |
|---|---|---|---|
| **Tiquetera 30 días** | $300.000 | $10.000/día | $2.000/día ($60.000/mes) |
| **Tiquetera 15 días** | $150.000 | $10.000/día | $2.000/día ($30.000/mes) |
| **Almuerzo individual** | $12.000 | $12.000/día | — |
| **Desechable (recipiente)** | $1.000 | — | Cargo adicional por llevar |

### Métricas Actuales del Negocio

| Métrica | Valor |
|---|---|
| **Clientes con tiquetera activa** | ~65 |
| **Ingreso estimado mensual (tiqueteras)** | ~$19.500.000 COP (65 × $300.000) |
| **Operadores del sistema** | 3 personas |

### Análisis de Valor

```
Ingreso por tiquetera de 30 días:  $300.000 COP
Costo de 30 almuerzos normales:   $360.000 COP (30 × $12.000)
Descuento al cliente:              $60.000 COP (16.7%)

Para Mariana:
- Ingreso garantizado por adelantado
- Previsibilidad: sabe que ~65 almuerzos son fijos/día
- Reducción de desperdicio por planificación
```

---

## Requisitos Funcionales

### RF01 — Gestión de Clientes
- Registrar clientes con: nombre, teléfono (WhatsApp), y notas opcionales
- Buscar cliente por nombre o teléfono
- Ver historial de tiqueteras del cliente
- Activar / desactivar clientes

### RF02 — Gestión de Tiqueteras
- Crear tiquetera de **15 días** o **30 días** para un cliente
- Definir fecha de inicio y calcular automáticamente fecha de vencimiento
- Visualizar estado: activa, vencida, consumida
- Ver tiqueteras que vencen en los próximos 3 días (alerta)

### RF03 — Registro de Asistencia (Marcación Diaria)
- Marcar presencia del cliente (equivalente al risco en el cartón)
- Busca rápida: por nombre, teléfono, o código QR
- Impedir doble marcación en el mismo día
- Registrar si usó **desechable** (+$1.000 COP)
- Funcionar con conexión inestable (queue offline)

### RF04 — Vista del Cliente (Portal Público)
- Acceso via link único enviado por WhatsApp (sin login)
- Ver tiquetera activa: días usados, días restantes, fecha de vencimiento
- Barra de progreso visual del consumo
- Botón de contacto directo por WhatsApp para renovar

### RF05 — Dashboard Administrativo
- Vista diaria: cuántos almuerzos servir hoy (tiqueteras activas)
- Vista de vencimientos: tiqueteras que vencen esta semana
- Ingresos del período (semanal, mensual)
- Tasa de renovación de tiqueteras
- Clientes más frecuentes

### RF06 — Notificaciones WhatsApp (Fase 2)
- Notificar al cliente cuando su tiquetera tiene 3 días restantes
- Notificar al cliente cuando su tiquetera venció
- Enviar link de acceso a su portal al crear tiquetera
- (Implementación via API de WhatsApp Business o integración tipo Twilio)

### RF07 — Multi-usuario
- 3 usuarios operadores con acceso al sistema
- Roles: Administrador (Mariana) y Operador (empleados)
- Log de acciones (quién marcó qué y cuándo)

---

## Requisitos No Funcionales

| Categoría | Requisito |
|---|---|
| **Rendimiento** | Marcación de presencia en < 3 segundos |
| **Disponibilidad** | 99.5% uptime (restaurante opera 6-7 días/semana) |
| **Seguridad** | Links de cliente con token único (no adivinable) |
| **Escalabilidad** | Soportar hasta 500 clientes activos (visión de crecimiento) |
| **Usabilidad** | Operable por persona sin experiencia técnica |
| **Responsive** | Funcional en celular Android y computador |
| **Idioma** | Español colombiano |
| **Moneda** | Peso colombiano (COP), sin decimales |
| **Offline** | Marcación debe funcionar offline y sincronizar después |

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Mariana/operadores no adoptan el sistema | Media | Alto | UI extremadamente simple, período de transición con cartón + digital |
| Clientes no acceden al link | Baja | Bajo | El portal del cliente es un bonus, no es crítico para la operación |
| Conexión inestable en el restaurante | Media | Alto | Sistema offline-first con sincronización |
| Crecimiento excede capacidad del sistema | Baja | Medio | Arquitectura elástica desde el inicio |

---

## Métricas de Éxito

### Semana 1-2 (Adopción)
- [ ] Mariana y 3 operadores usan el sistema sin ayuda
- [ ] 100% de marcaciones se hacen digitalmente
- [ ] Cartones de papel eliminados

### Mes 1 (Valor)
- [ ] Dashboard muestra datos financieros correctos
- [ ] Tasa de renovación visible y > 70%
- [ ] Cero casos de fraude

### Mes 3 (Crecimiento)
- [ ] Aumento de 10% en clientes con tiquetera (65 → 72+)
- [ ] Notificaciones WhatsApp automatizadas
- [ ] Mariana toma decisiones basadas en datos del dashboard

---

## Próximos Pasos

| Paso | Agente | Entregable |
|---|---|---|
| 1. Crear PRD detallado | @pm (Morgan) | `docs/prd/` — Features, requisitos, prioridades |
| 2. Diseñar arquitectura | @architect | `docs/architecture/` — Stack, modelos de datos, diseño del sistema |
| 3. Fragmentar en stories | @sm | `docs/stories/` — Stories de desarrollo numeradas |
| 4. Implementar | @dev | Código fuente |
| 5. Validar | @qa | Tests y garantía de calidad |

---

## Anexos

### Anexo A: Logo de Linda Mariana Restaurante

La logo oficial del restaurante presenta un diseño circular con borde en pincelada naranja/ámbar. En el centro, el nombre "Linda" aparece en tipografía script negra elegante, seguido de "Mariana" en cursiva naranja/dorada y "restaurante" en minúsculas sans-serif. La mascota es una chefcita morena con gorro de chef blanco, delantal rojo y bandeja de servir, ubicada al costado derecho del texto. La sigla "LM" (Linda Mariana) es la misma que aparece en los cartones físicos de las tiqueteras.

### Anexo B: Foto del Sistema Actual (Cartones)

Los cartones naranjas de Linda Mariana Restaurante muestran el sistema de marcación manual con 30 casillas numeradas (1-15 y 16-30), marcadas con un risco diagonal y fecha escrita a mano. El logo "LM" y el número de WhatsApp 3146713097 están impresos en la parte superior. El color naranja de los cartones coincide con el color primario de la marca.

### Anexo C: Análisis de Competencia (Pendiente)

Investigar si existen soluciones similares en Colombia para el mercado de restaurantes populares con tiqueteras.

---

_Creado por @analyst (Atlas) | Fecha: 2026-04-07 | Synkra AIOX_
