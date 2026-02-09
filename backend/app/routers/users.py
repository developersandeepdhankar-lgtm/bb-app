from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import hash_password

# =====================================================
# JWT SETTINGS (adjust if already defined elsewhere)
# =====================================================
SECRET_KEY = "CHANGE_ME_SECRET_KEY"
ALGORITHM = "HS256"

# OAuth2 scheme (THIS WAS MISSING ❌)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)

# =====================================================
# GET ALL USERS
# =====================================================
@router.get("", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.name).all()

# =====================================================
# CREATE USER
# =====================================================
@router.post("", response_model=UserResponse)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):

    if db.query(User).filter(User.mobile == payload.mobile).first():
        raise HTTPException(status_code=400, detail="Mobile already exists")

    if payload.email:
        if db.query(User).filter(User.email == payload.email).first():
            raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        name=payload.name,
        mobile=payload.mobile,
        email=payload.email,
        role_id=payload.role_id,
        password=hash_password(payload.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# =====================================================
# DELETE USER
# =====================================================
@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

# =====================================================
# AUTH DEPENDENCY (USED BY DASHBOARD)
# =====================================================
def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int | None = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user
