from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


# Goal Progress Schema
class GoalProgressBase(BaseModel):
    value: float
    notes: Optional[str] = None


class GoalProgressCreate(GoalProgressBase):
    goal_id: int


class GoalProgressUpdate(GoalProgressBase):
    pass


class GoalProgressInDBBase(GoalProgressBase):
    id: int
    goal_id: int
    logged_at: datetime

    class Config:
        orm_mode = True


class GoalProgress(GoalProgressInDBBase):
    pass


# Shared properties for Goal
class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    target_value: float
    current_value: Optional[float] = 0.0
    unit: str
    target_date: Optional[datetime] = None
    is_completed: Optional[bool] = False
    is_recurring: Optional[bool] = False
    frequency: Optional[str] = None


# Properties to receive via API on creation
class GoalCreate(GoalBase):
    team_id: Optional[int] = None


# Properties to receive via API on update
class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    unit: Optional[str] = None
    target_date: Optional[datetime] = None
    is_completed: Optional[bool] = None
    is_recurring: Optional[bool] = None
    frequency: Optional[str] = None
    team_id: Optional[int] = None


class GoalInDBBase(GoalBase):
    id: int
    user_id: int
    team_id: Optional[int] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        orm_mode = True


# Additional properties to return via API
class Goal(GoalInDBBase):
    pass


# Goal with progress information
class GoalWithProgress(Goal):
    progress_logs: List[GoalProgress] = []


# Goal with team information
class GoalWithTeam(Goal):
    team: Optional["TeamBase"] = None


# Goal with user information
class GoalWithUser(Goal):
    user: "UserBase"


# Complete goal information
class GoalComplete(Goal):
    user: "UserBase"
    team: Optional["TeamBase"] = None
    progress_logs: List[GoalProgress] = []


from .user import UserBase
from .team import TeamBase

GoalWithTeam.update_forward_refs()
GoalWithUser.update_forward_refs()
GoalComplete.update_forward_refs()