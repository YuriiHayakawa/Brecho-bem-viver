from fastapi import FastAPI

from app.api.routes.health import router as health_router
from app.core.config import settings


app = FastAPI(title=settings.APP_NAME)


# Rotas
app.include_router(health_router, prefix="/health")


@app.get("/", summary="Root")
async def root():
    """Endpoint raiz simples para validação rápida."""
    return {"message": f"{settings.APP_NAME} está em execução.", "env": settings.APP_ENV}
