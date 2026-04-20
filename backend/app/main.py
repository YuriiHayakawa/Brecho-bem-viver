from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes.health import router as health_router
from app.api.routes.db_teste import router as db_router
from app.api.routes.user_route import router as users_router
from app.api.routes.product_route import router as product_router
from app.api.routes.product_image_route import router as product_image_router
from app.api.routes.auth_route import router as auth_router
from app.api.routes.sale_route import router as sales_router

from app.core.config import settings
from app.database import engine, Base

# Importa todos os models para que o Base.metadata os conheça
from app.models import User, Product, ProductImage, Sale


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Cria todas as tabelas no banco ao iniciar (se ainda não existirem)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

# CORS — permite chamadas do frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(health_router, prefix="/health")
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(db_router, prefix="/db")
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(product_router, prefix="/products", tags=["Products"])
app.include_router(product_image_router, tags=["Product Images"])
app.include_router(sales_router, prefix="/sales", tags=["Sales"])
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/", summary="Root")
async def root():
    return {
        "message": f"{settings.APP_NAME} está em execução.",
        "env": settings.APP_ENV
    }
