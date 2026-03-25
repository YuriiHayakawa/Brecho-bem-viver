from fastapi import APIRouter


router = APIRouter()


@router.get("/", summary="Health check", tags=["Health"])
async def health_check():
    """Endpoint simples para verificar se a API está respondendo."""
    return {"status": "ok"}
