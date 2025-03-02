from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base

# Association table for many-to-many relationship between Users and Events
user_event = Table(
    "user_event",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("event_id", Integer, ForeignKey("events.id"), primary_key=True),
)


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign keys
    organizer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)  # Optional team association
    
    # Event type (e.g., "call", "personal")
    event_type = Column(String, nullable=False, default="personal")
    
    # Meeting link or location
    location = Column(String, nullable=True)
    meeting_link = Column(String, nullable=True)
    
    # Relationships
    organizer = relationship("User", back_populates="events")
    team = relationship("Team", back_populates="events")
    attendees = relationship("User", secondary=user_event)