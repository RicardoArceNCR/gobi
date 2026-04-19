# GOBi — Visión General y Arquitectura

> Archivo maestro. Úsalo como contexto base en cada sesión de trabajo.

---

## Qué es GOBi

**Plataforma de inteligencia política accesible para Costa Rica.**

Sistema que traduce la actividad legislativa en información navegable, entendible y accionable. Mezcla de dashboard cívico + sistema de transparencia + motor de recomendación político con AI.

---

## Stack definitivo

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| Estado del servidor | React Query (@tanstack/react-query) |
| Backend | FastAPI + Python 3.11 |
| Base de datos | PostgreSQL 15 |
| ORM | SQLAlchemy 2.0 + Alembic (migraciones) |
| Auth | Clerk |
| Cache / Feed | Redis (fase 7+) |
| AI | RAG propio (LangChain + embeddings) |
| Despliegue | Vercel (frontend) + Railway (backend + DB) |

---

## Módulos del producto

| # | Módulo | Descripción |
|---|---|---|
| 1 | Feed político | Timeline de comunicados y actividad — pantalla principal |
| 2 | Expediente de proyecto | Detalle completo: texto, estado, audiencias, comisión, votos |
| 3 | Comisiones | Proyectos activos, miembros, actividad reciente |
| 4 | Fracciones | Métricas por partido, miembros, proyectos presentados |
| 5 | Gobierno | Estructura ejecutiva con jerarquía clara |
| 6 | Perfil diputado | Votaciones, asistencia, salario, gasolina, proyectos |
| 7 | Intereses / onboarding | Segmentación temática del usuario |
| 8 | Filtros avanzados | Exploración combinada con lógica real |
| 9 | Auth | Login social + email, roles diferenciados |
| 10 | Panel admin | CRUD, cambio de estados, auditoría |

---

## Modelo de datos completo

```python
# Entidades principales y sus relaciones

Diputado
  id, nombre, foto_url, partido_id, fecha_inicio
  salario, monto_gasolina
  → comisiones: [Comision] (many-to-many)
  → proyectos: [ProyectoLey] (como proponente)
  → votos: [Voto]

ProyectoLey
  id, codigo (único, index), titulo, descripcion, texto_completo
  estado: presentado|en_comision|en_debate|votado|aprobado|archivado
  fecha_presentacion
  created_at, updated_at  ← timestamps del modelo (updated_at = fecha_ultimo_cambio)
  proponente_id → Diputado
  comision_id → Comision (nullable)
  → temas: [Tema] (many-to-many)
  → historial: [CambioEstado]
  → documentos: [Documento]
  → votos: [Voto]

CambioEstado
  id, proyecto_id, estado_anterior, estado_nuevo
  motivo, usuario_id, usuario_nombre, created_at

Comision
  id, nombre, descripcion
  → miembros: [Diputado] (many-to-many)
  → proyectos: [ProyectoLey]

Partido
  id, nombre, color_hex, logo_url
  → diputados: [Diputado]

Comunicado
  id, titulo, contenido, fuente, fecha, prioridad
  → proyecto_id (nullable)
  → diputado_id (nullable)
  → comision_id (nullable)

Voto
  id, proyecto_id, diputado_id
  valor: a_favor|en_contra|abstencion|ausente

Documento
  id, proyecto_id, nombre, url, tipo: pdf|audio|video
  created_at

Tema
  id, nombre, slug, color_hex

Usuario
  id (Clerk ID), nombre, email, avatar_url
  rol: ciudadano|diputado|admin
  → intereses: [Tema]  (guardado en backend, no solo en Clerk)
  → seguidos: [ProyectoLey] (many-to-many, tabla seguimiento)

EntradaBitacora
  id, entidad_tipo, entidad_id
  accion: creacion|edicion|cambio_estado|eliminacion
  campo_modificado, valor_anterior, valor_nuevo
  motivo, usuario_id, usuario_nombre, created_at

# Tabla de seguimiento (usuario ↔ proyecto)
seguimiento
  usuario_id (Clerk ID), proyecto_id
```

---

## Narrativa principal resuelta

**Problema:** Todo competía por atención. No había punto de entrada claro.

**Solución:** El home es una sola pregunta respondida: *"¿Qué está pasando HOY en la Asamblea?"*

Jerarquía visual del feed:
```
🔴 URGENTE     → Proyecto con votación hoy o mañana
🟡 EN DEBATE   → Proyectos en discusión activa esta semana
🟢 ACTUALIZADO → Cambios de estado en últimas 48h
⚪ SEGUIDOS    → Actividad en proyectos que el usuario sigue
```

---

## Sistema de estados resuelto

```
presentado  → en_comision → en_debate → votado → aprobado
     ↘             ↘            ↘          ↘
  archivado     archivado    archivado   archivado
```

> Todo estado (excepto `aprobado` y `archivado`) puede transicionar a `archivado`.
> Cada transición requiere: estado_anterior, estado_nuevo, motivo, usuario, fecha.

---

## Filtros inteligentes resueltos

Filtros como query params persistentes con lógica AND:
```
/proyectos?estado=en_debate&tema=educacion&partido=PLN&busqueda=becas&page=1
```

Todos los filtros se serializan en URL → compartibles, navegables con Back, persistentes al recargar.

---

## Conexión entre pantallas resuelta

Toda entidad enlaza con sus relacionadas:

```
Comunicado → Proyecto de ley relacionado
Comunicado → Diputado que lo generó
Comunicado → Comisión responsable

Proyecto → Comisión asignada
Proyecto → Diputado proponente
Proyecto → Partido del proponente
Proyecto → Votos individuales por diputado

Diputado → Sus proyectos
Diputado → Su partido
Diputado → Sus comisiones

Comisión → Sus proyectos activos
Comisión → Sus miembros (con partido)
```

---

## Ventajas competitivas

1. **Relacionalidad** — grafo de datos entre diputado, proyecto, comisión, partido
2. **Transparencia accionable** — salarios, gasolina, asistencia, votaciones individuales
3. **AI integrada** — resúmenes, análisis crítico, lenguaje simple (RAG propio)

---

## Lo que NO hacer (por ahora)

- Microservicios, GraphQL, sockets, app móvil
- Auth casera (usar Clerk)
- Estado global (Zustand/Redux) antes de necesitarlo de verdad
- Notificaciones antes de tener base de datos sólida

---

## Archivos de la guía

| Archivo | Contenido |
|---|---|
| `GOBi_00` | Este archivo — arquitectura y modelo de datos |
| `GOBi_01` | Fase 1 — Frontend base con mock data |
| `GOBi_02` | Fase 2 — Backend FastAPI completo |
| `GOBi_03` | Fase 3 — Consumo de API desde frontend |
| `GOBi_04` | Fase 4 — Sistema de diseño |
| `GOBi_05` | Fase 5 — Auth y roles |
| `GOBi_06` | Fase 6 — Panel administrativo |
| `GOBi_07` | Fase 7 — AI, seguimiento, escala |
