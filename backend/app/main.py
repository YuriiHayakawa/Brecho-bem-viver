from fastapi import FastAPI
from app.api.routes.health import router as health_router
from app.api.routes.db_teste import router as db_router
from app.api.routes.user_route import router as users_router
from app.api.routes.product_route import router as product_router
from app.core.config import settings
from app.models import User, Product, Sale

app = FastAPI(title=settings.APP_NAME)

# Rotas
app.include_router(health_router, prefix="/health")
app.include_router(db_router, prefix="/db")
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(product_router, prefix="/products", tags=["Products"])

@app.get("/", summary="Root")
async def root():
    return {
        "message": f"{settings.APP_NAME} está em execução.",
        "env": settings.APP_ENV
    }
