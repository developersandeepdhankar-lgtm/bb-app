from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate
from app.schemas.auth import LoginSchema

router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"]
)

# OAuth2 scheme (expects Authorization: Bearer <token>)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# =====================================================
# SIGNUP
# =====================================================
@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(data: UserCreate, db: Session = Depends(get_db)):

    if db.query(User).filter(User.mobile == data.mobile).first():
        raise HTTPException(status_code=400, detail="Mobile already exists")

    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        name=data.name,
        mobile=data.mobile,
        email=data.email,
        password=hash_password(data.password),
        role_id=data.role_id
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "Account created successfully"}


# =====================================================
# LOGIN
# =====================================================
@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.mobile == data.mobile).first()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Store mobile in JWT "sub"
    token = create_access_token({"sub": str(user.mobile)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "mobile": user.mobile,
            "email": user.email,
            "role_id": user.role_id
        }
    }


# =====================================================
# CURRENT USER (JWT → MOBILE → DB)
# =====================================================
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    print(">>> TOKEN RECEIVED IN BACKEND:", token)

    if not token:
        raise HTTPException(status_code=401, detail="Token missing")

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        mobile: str | None = payload.get("sub")
        if not mobile:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except JWTError as e:
        print(">>> JWT ERROR:", str(e))
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.mobile == mobile).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user
