from fastapi import APIRouter, Depends
from app.core.auth_jwt import get_current_user

router = APIRouter()

@router.get("/analytics")
def analytics(current_user = Depends(get_current_user)):
    return {
        "message": "Welcome to Analytics",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "mobile": current_user.mobile,
        }
    }
