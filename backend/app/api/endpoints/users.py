from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_superuser, get_current_active_user
from app.core.security import get_password_hash, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import User as UserSchema
from app.schemas.user import UserCreate, UserUpdate, UserWithTeams

router = APIRouter()


@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    password: str = Body(None),
    full_name: str = Body(None),
    email: str = Body(None),
    username: str = Body(None),
    avatar: str = Body(None),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update current user.
    """
    current_user_data = jsonable_encoder(current_user)
    user_in = UserUpdate(**current_user_data)
    
    if password is not None:
        user_in.password = password
    if full_name is not None:
        user_in.full_name = full_name
    if email is not None:
        user_in.email = email
    if username is not None:
        user_in.username = username
    if avatar is not None:
        user_in.avatar = avatar
    
    if user_in.password:
        hashed_password = get_password_hash(user_in.password)
        current_user.hashed_password = hashed_password
        
    if user_in.email:
        current_user.email = user_in.email
    if user_in.username:
        current_user.username = user_in.username
    if user_in.full_name:
        current_user.full_name = user_in.full_name
    if user_in.avatar:
        current_user.avatar = user_in.avatar
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Retrieve users. Admin only.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.post("/", response_model=UserSchema)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists in the system.",
        )
    
    user = db.query(User).filter(User.username == user_in.username).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this username already exists in the system.",
        )
    
    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/with-teams", response_model=List[UserWithTeams])
def read_users_with_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve all users with their team information.
    """
    users = db.query(User).all()
    return users


@router.get("/{user_id}", response_model=UserSchema)
def read_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    return user