from typing import Any, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.models.goal import Goal, GoalProgress
from app.schemas.goal import (
    Goal as GoalSchema, 
    GoalCreate, 
    GoalUpdate, 
    GoalWithProgress,
    GoalProgress as GoalProgressSchema,
    GoalProgressCreate
)

router = APIRouter()


@router.get("/", response_model=List[GoalSchema])
def read_goals(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve goals for the current user.
    """
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).offset(skip).limit(limit).all()
    return goals


@router.post("/", response_model=GoalSchema)
def create_goal(
    *,
    db: Session = Depends(get_db),
    goal_in: GoalCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create new goal.
    """
    goal = Goal(
        **goal_in.dict(),
        user_id=current_user.id
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.put("/{goal_id}", response_model=GoalSchema)
def update_goal(
    *,
    db: Session = Depends(get_db),
    goal_id: int,
    goal_in: GoalUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update a goal.
    """
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    update_data = goal_in.dict(exclude_unset=True)
    
    # If marking as completed, set the completed_at timestamp
    if update_data.get("is_completed", False) and not goal.is_completed:
        update_data["completed_at"] = datetime.now()
    
    for field, value in update_data.items():
        setattr(goal, field, value)
    
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.get("/{goal_id}", response_model=GoalWithProgress)
def read_goal(
    *,
    db: Session = Depends(get_db),
    goal_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get goal by ID.
    """
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.delete("/{goal_id}", response_model=GoalSchema)
def delete_goal(
    *,
    db: Session = Depends(get_db),
    goal_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete a goal.
    """
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return goal


@router.get("/team/{team_id}", response_model=List[GoalSchema])
def read_team_goals(
    *,
    db: Session = Depends(get_db),
    team_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve goals for a specific team.
    """
    # Check if the user is a member of the team
    team_member = any(team.id == team_id for team in current_user.teams)
    if not team_member:
        raise HTTPException(status_code=403, detail="Not a member of this team")
    
    goals = db.query(Goal).filter(Goal.team_id == team_id).all()
    return goals


@router.post("/{goal_id}/progress", response_model=GoalProgressSchema)
def log_goal_progress(
    *,
    db: Session = Depends(get_db),
    goal_id: int,
    progress_in: GoalProgressCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Log progress for a goal.
    """
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    progress = GoalProgress(
        goal_id=goal_id,
        value=progress_in.value,
        notes=progress_in.notes
    )
    
    # Update the current value of the goal
    goal.current_value += progress_in.value
    
    # Check if goal is completed
    if goal.current_value >= goal.target_value and not goal.is_completed:
        goal.is_completed = True
        goal.completed_at = datetime.now()
        
        # Update the user's streak
        current_user.current_streak += 1
        if current_user.current_streak > current_user.longest_streak:
            current_user.longest_streak = current_user.current_streak
    
    db.add(progress)
    db.add(goal)
    db.add(current_user)
    db.commit()
    db.refresh(progress)
    return progress


@router.get("/{goal_id}/progress", response_model=List[GoalProgressSchema])
def get_goal_progress(
    *,
    db: Session = Depends(get_db),
    goal_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get progress logs for a goal.
    """
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    progress_logs = db.query(GoalProgress).filter(GoalProgress.goal_id == goal_id).all()
    return progress_logs