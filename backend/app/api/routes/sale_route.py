from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.sale_schema import SaleCreate, SaleResponse
from app.services import sale_service

router = APIRouter()


@router.get("/", response_model=list[SaleResponse], summary="Listar vendas")
def list_sales(db: Session = Depends(get_db)):
    return sale_service.list_sales(db)


@router.post("/", response_model=SaleResponse, summary="Registrar venda")
def create_sale(sale: SaleCreate, db: Session = Depends(get_db)):
    return sale_service.create_sale(db, sale)