from fastapi import APIRouter, status


router = APIRouter()

@router.get("/health")
def health_check():
    return {"message": "health check réussis"}