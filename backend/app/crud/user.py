import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user_data import UserData


def get_all_users(db: Session):
    """Get all users from the database."""
    users = db.query(UserData).all()
    return users


def get_user_data(user_id: str, db: Session):
    """Get the user data for a given user id."""
    user_uuid = uuid.UUID(user_id).hex
    stmt = select(
        UserData.id,
        UserData.username,
        UserData.first_name,
        UserData.last_name,
        UserData.role,
    ).where(UserData.id == user_uuid)
    user_data = db.execute(stmt).scalars().first()
    return user_data


def get_user_by_username(username: str, db: Session):
    """Get the user data for a given username."""
    user = db.query(UserData).filter(UserData.username == username).first()
    return user


def create_user(username, first_name, last_name, role, db):
    """Create a new user."""
    user = UserData(
        username=username, first_name=first_name, last_name=last_name, role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
