from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)  # Optional team association
    
    # Goal metrics
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, default=0.0)
    unit = Column(String, nullable=False)  # e.g., "miles", "pages", "challenges"
    
    # Goal time information
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    target_date = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    is_completed = Column(Boolean, default=False)
    
    # For recurring goals
    is_recurring = Column(Boolean, default=False)
    frequency = Column(String, nullable=True)  # "daily", "weekly", "monthly"
    
    # Relationships
    user = relationship("User", back_populates="goals")
    team = relationship("Team", back_populates="goals")
    progress_logs = relationship("GoalProgress", back_populates="goal", cascade="all, delete-orphan")


class GoalProgress(Base):
    __tablename__ = "goal_progress"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    value = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    goal = relationship("Goal", back_populates="progress_logs")