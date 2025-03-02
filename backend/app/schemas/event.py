from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


# Shared properties
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    event_type: str = "personal"  # "call", "personal", etc.
    location: Optional[str] = None
    meeting_link: Optional[str] = None


# Properties to receive via API on creation
class EventCreate(EventBase):
    team_id: Optional[int] = None
    attendee_ids: Optional[List[int]] = None


# Properties to receive via API on update
class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    event_type: Optional[str] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    team_id: Optional[int] = None
    attendee_ids: Optional[List[int]] = None


class EventInDBBase(EventBase):
    id: int
    organizer_id: int
    team_id: Optional[int] = None
    created_at: datetime

    class Config:
        orm_mode = True


# Additional properties to return via API
class Event(EventInDBBase):
    pass


# Event with organizer information
class EventWithOrganizer(Event):
    organizer: "UserBase"


# Event with team information
class EventWithTeam(Event):
    team: Optional["TeamBase"] = None


# Event with attendee information
class EventWithAttendees(Event):
    attendees: List["UserBase"] = []


# Complete event information
class EventComplete(Event):
    organizer: "UserBase"
    team: Optional["TeamBase"] = None
    attendees: List["UserBase"] = []


from .user import UserBase
from .team import TeamBase

EventWithOrganizer.update_forward_refs()
EventWithTeam.update_forward_refs()
EventWithAttendees.update_forward_refs()
EventComplete.update_forward_refs()