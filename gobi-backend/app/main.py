from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import proyectos, diputados, comisiones
# Los routers de comisiones y comunicados se agregan al construir esos módulos
# (ver tareas/AGREGAR_MODULO.md para el patrón completo)

app = FastAPI(title="GOBi API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(proyectos.router)
app.include_router(diputados.router)
app.include_router(comisiones.router)
# app.include_router(comunicados.router)  # agregar al crear ese módulo

@app.get("/health")
def health():
    return {"status": "ok"}
