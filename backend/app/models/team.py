from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base
from app.models.user import user_team


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    members = relationship("User", secondary=user_team, back_populates="teams")
    goals = relationship("Goal", back_populates="team")
    events = relationship("Event", back_populates="team")
    
    # Team cycle information (optional)
    cycle_name = Column(String, nullable=True)
    cycle_start_date = Column(DateTime(timezone=True), nullable=True)
    cycle_end_date = Column(DateTime(timezone=True), nullable=True)