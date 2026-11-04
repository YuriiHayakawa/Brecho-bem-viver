from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    # Testa a conexão antes de usar e reconecta se o servidor a derrubou
    # (ex.: conexão ociosa encerrada pelo Railway) — sem isso a próxima
    # requisição falhava com erro 500.
    pool_pre_ping=True,
    # Renova conexões com mais de 5 min, antes de algum proxy derrubá-las
    pool_recycle=300,
    # Até 30 conexões simultâneas (padrão era 15) para aguentar picos de acesso.
    # Fica bem abaixo do limite padrão do Postgres (100 conexões).
    pool_size=10,
    max_overflow=20,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()