from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


# Shared properties
class TeamBase(BaseModel):
    name: str
    description: Optional[str] = None
    cycle_name: Optional[str] = None
    cycle_start_date: Optional[datetime] = None
    cycle_end_date: Optional[datetime] = None


# Properties to receive via API on creation
class TeamCreate(TeamBase):
    pass


# Properties to receive via API on update
class TeamUpdate(TeamBase):
    name: Optional[str] = None


class TeamInDBBase(TeamBase):
    id: int
    created_at: datetime
    created_by_id: int

    class Config:
        orm_mode = True


# Additional properties to return via API
class Team(TeamInDBBase):
    pass


# Team with member information
class TeamWithMembers(Team):
    members: List["UserBase"] = []


# Team with goal information
class TeamWithGoals(Team):
    goals: List["GoalBase"] = []


# Team with event information
class TeamWithEvents(Team):
    events: List["EventBase"] = []


# Complete team information
class TeamComplete(Team):
    members: List["UserBase"] = []
    goals: List["GoalBase"] = []
    events: List["EventBase"] = []


from .user import UserBase
from .goal import GoalBase
from .event import EventBase

TeamWithMembers.update_forward_refs()
TeamWithGoals.update_forward_refs()
TeamWithEvents.update_forward_refs()
TeamComplete.update_forward_refs()