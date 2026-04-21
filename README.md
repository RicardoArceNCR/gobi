# GOBi

Plataforma de inteligencia política para Costa Rica. Traduce la actividad legislativa en información navegable, entendible y accionable.

## Stack actual

### Frontend
- Next.js 16.2.4 (App Router)
- React 19.2.4
- TypeScript
- Tailwind CSS 4
- React Query v5
- Axios (con normalización de errores)
- Clerk (Auth)

### Backend
- FastAPI 0.136.0
- SQLAlchemy 2 (Modelos Tipados)
- PostgreSQL
- Alembic (Migraciones)
- Clerk

## Estructura principal

- `/frontend` → aplicación web pública (Features Architecture)
- `/gobi-backend` → API RESTful y lógica de negocio
- `/docs` → documentación detallada, arquitectura y estrategias de hardening

## Estado actual (Phase 3.5 Hardening Ready)

- **Proyectos**: Listado filtrado, paginación, detalle completo (refactorizado), timeline, documentos y votaciones.
- **Diputados**: Listado con filtros de búsqueda y partido, paginación, perfiles detallados con historial y finanzas.
- **Comisiones**: Listado con conteos reales (miembros/proyectos), paginación y detalle funcional.
- **Temas**: Filtros reales conectados a base de datos.
- **Arquitectura**: Adapters de normalización backend -> frontend, contratos de paginación unificados y manejo de errores estandarizado.

## Próximos pasos (Fase 4+)

- Implementar estrategia de bitácora (logging) definida.
- Integración completa de permisos por roles (Ciudadano, Diputado, Admin).
- Rediseño UX Avanzado (Aesthetics & Micromotions).
- Auth extremo a extremo (Frontend + Backend).

## Requisitos
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+

## Instalación y Ejecución

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd gobi-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Configurar .env basado en .env.example
alembic upgrade head
python scripts/seed_demo.py
uvicorn app.main:app --reload
```

## Documentación adicional
- [INICIO.md](./INICIO.md): Guía de entrada para desarrolladores y estado de fases.
- [docs/hardening_strategy.md](./docs/hardening_strategy.md): Estrategia de normalización y seguridad.