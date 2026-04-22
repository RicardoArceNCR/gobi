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

## Estado actual

Fase 3.5 está funcionalmente cerrada y operativa, con:
- contratos frontend-backend estables mediante adapters,
- paginación unificada,
- filtros reales conectados a base de datos,
- listados y detalles funcionales de proyectos, diputados y comisiones,
- bitácora base para mutaciones de proyectos.

Pendientes antes del cierre total de validación:
- auth extremo a extremo (frontend + backend),
- permisos mínimos visibles por rol,
- validación final de bitácora suficiente,
- alineación final de documentación pública.

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