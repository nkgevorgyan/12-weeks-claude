from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.models.team import Team
from app.schemas.team import (
    Team as TeamSchema,
    TeamCreate,
    TeamUpdate,
    TeamWithMembers,
    TeamWithGoals,
    TeamWithEvents,
    TeamComplete
)

router = APIRouter()


@router.get("/", response_model=List[TeamSchema])
def read_teams(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve teams.
    """
    teams = current_user.teams
    return teams[skip : skip + limit]


@router.post("/", response_model=TeamSchema)
def create_team(
    *,
    db: Session = Depends(get_db),
    team_in: TeamCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create new team.
    """
    team = Team(
        **team_in.dict(),
        created_by_id=current_user.id
    )
    team.members.append(current_user)  # Add creator as a member
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


@router.put("/{team_id}", response_model=TeamSchema)
def update_team(
    *,
    db: Session = Depends(get_db),
    team_id: int,
    team_in: TeamUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update a team.
    """
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if user is the creator of the team
    if team.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_data = team_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(team, field, value)
    
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


@router.get("/{team_id}", response_model=TeamComplete)
def read_team(
    *,
    db: Session = Depends(get_db),
    team_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get team by ID.
    """
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if user is a member of the team
    if current_user not in team.members:
        raise HTTPException(status_code=403, detail="Not a member of this team")
    
    return team


@router.delete("/{team_id}", response_model=TeamSchema)
def delete_team(
    *,
    db: Session = Depends(get_db),
    team_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete a team.
    """
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if user is the creator of the team
    if team.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(team)
    db.commit()
    return team


@router.post("/{team_id}/members", response_model=TeamWithMembers)
def add_team_member(
    *,
    db: Session = Depends(get_db),
    team_id: int,
    user_id: int = Body(...),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Add a member to the team.
    """
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if current user is a member of the team
    if current_user not in team.members:
        raise HTTPException(status_code=403, detail="Not a member of this team")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user in team.members:
        raise HTTPException(status_code=400, detail="User is already a member of this team")
    
    team.members.append(user)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


@router.delete("/{team_id}/members/{user_id}", response_model=TeamWithMembers)
def remove_team_member(
    *,
    db: Session = Depends(get_db),
    team_id: int,
    user_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Remove a member from the team.
    """
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if current user is the team creator
    if team.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user not in team.members:
        raise HTTPException(status_code=400, detail="User is not a member of this team")
    
    # Cannot remove the team creator
    if user.id == team.created_by_id:
        raise HTTPException(status_code=400, detail="Cannot remove the team creator")
    
    team.members.remove(user)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


@router.get("/{team_id}/members", response_model=TeamWithMembers)
def get_team_members(
    *,
    db: Session = Depends(get_db),
    team_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get team members.
    """
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if current user is a member of the team
    if current_user not in team.members:
        raise HTTPException(status_code=403, detail="Not a member of this team")
    
    return team


@router.get("/{team_id}/goals", response_model=TeamWithGoals)
def get_team_goals(
    *,
    db: Session = Depends(get_db),
    team_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get team goals.
    """
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if current user is a member of the team
    if current_user not in team.members:
        raise HTTPException(status_code=403, detail="Not a member of this team")
    
    return team


@router.get("/{team_id}/events", response_model=TeamWithEvents)
def get_team_events(
    *,
    db: Session = Depends(get_db),
    team_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get team events.
    """
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if current user is a member of the team
    if current_user not in team.members:
        raise HTTPException(status_code=403, detail="Not a member of this team")
    
    return team