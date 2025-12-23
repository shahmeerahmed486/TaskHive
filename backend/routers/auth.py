from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, Field, EmailStr
from typing import Annotated, Literal, List
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt

from backend.models.base import SessionLocal
from backend.models.user import User

router = APIRouter(prefix='/auth', tags=['auth'])


SECRET_KEY = '24b0898fb50fba000136a087daf9c07763c000a1caf2957355ca8ff679c17bbb'
ALGORITHM = 'HS256'
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/auth/login')


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def authenticate_user(email: str, password: str, db: Session):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return False

    if not pwd_context.verify(password, user.hashed_password):
        return False

    return user


def create_access_token(email: str, user_id: int, expires_delta: timedelta):
    encode = {'sub': email, 'id': user_id}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({'exp': expires})

    return jwt.encode(encode, key=SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, key=SECRET_KEY, algorithms=[ALGORITHM])

        email: str = payload.get('sub')
        user_id: int = payload.get('id')

        if email is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="COuld not validate credentials")

        return {'email': email, 'user_id': user_id}

    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="COuld not validate credentials")


class UserCreate(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=6,
                          description="Password (min 6 characters)")
    role: Literal["client", "freelancer"] = Field(..., description="User role")
    name: str = Field(..., min_length=1, description="Full name")
    is_active: bool = True


class Token(BaseModel):
    access_token: str
    token_type: str


class UserRead(BaseModel):
    id: int
    email: EmailStr
    role: str
    name: str
    is_active: bool

    class Config:
        from_attributes = True


@router.post('/register', response_model=UserRead)
def register_user(payload: UserCreate, session: Session = Depends(get_session)):
    try:
        hashed = pwd_context.hash(payload.password)

        user = User(
            email=payload.email,
            hashed_password=hashed,
            role=payload.role,
            name=payload.name,
            is_active=True
        )

        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    except SQLAlchemyError as e:
        session.rollback()
        raise HTTPException(
            status_code=500, detail="Database error while creating user")


@router.post("/login", response_model=Token)
def login_user(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: Session = Depends(get_session)):
    try:
        user = authenticate_user(
            form_data.username, form_data.password, session)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        token = create_access_token(user.email, user.id, timedelta(minutes=20))
        return {'access_token': token, 'token_type': 'bearer'}
    except:
        raise HTTPException(status_code=401, detail="Not Authenticated")


@router.get("/users", response_model=List[UserRead])
def get_all_users(db: Session = Depends(get_session)):
    users = db.query(User).all()
    return users


@router.get("/users/{user_id}", response_model=UserRead)
def get_user(user_id: int, db: Session = Depends(get_session)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
