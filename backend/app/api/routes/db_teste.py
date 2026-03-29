from fastapi import APIRouter
from sqlalchemy import text

from app.database import engine

router = APIRouter()

@router.get("/", summary="Testar conexão com banco")
def test_db():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return {"database": "conectado", "result": result.scalar()}