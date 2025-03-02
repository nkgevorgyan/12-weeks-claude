from sqlalchemy import Boolean, Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base

# Association table for many-to-many relationship between Users and Teams
user_team = Table(
    "user_team",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("team_id", Integer, ForeignKey("teams.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    avatar = Column(String, nullable=True)  # URL to avatar image
    
    # Relationships
    goals = relationship("Goal", back_populates="user")
    teams = relationship("Team", secondary=user_team, back_populates="members")
    events = relationship("Event", back_populates="organizer")
    
    # User streak information
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)