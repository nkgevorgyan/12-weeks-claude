from typing import Any, List
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.models.event import Event
from app.schemas.event import (
    Event as EventSchema,
    EventCreate,
    EventUpdate,
    EventWithAttendees,
    EventComplete
)

router = APIRouter()


@router.get("/", response_model=List[EventSchema])
def read_events(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    start_date: datetime = None,
    end_date: datetime = None,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve events.
    """
    query = db.query(Event).filter(
        (Event.organizer_id == current_user.id) |  # Events organized by the user
        (Event.attendees.any(id=current_user.id))  # Events the user is attending
    )
    
    if start_date:
        query = query.filter(Event.start_time >= start_date)
    if end_date:
        query = query.filter(Event.end_time <= end_date)
    
    events = query.offset(skip).limit(limit).all()
    return events


@router.post("/", response_model=EventComplete)
def create_event(
    *,
    db: Session = Depends(get_db),
    event_in: EventCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create new event.
    """
    # Create the event
    event = Event(
        title=event_in.title,
        description=event_in.description,
        start_time=event_in.start_time,
        end_time=event_in.end_time,
        event_type=event_in.event_type,
        location=event_in.location,
        meeting_link=event_in.meeting_link,
        team_id=event_in.team_id,
        organizer_id=current_user.id
    )
    
    # Add the organizer as an attendee
    event.attendees.append(current_user)
    
    # Add other attendees if provided
    if event_in.attendee_ids:
        for attendee_id in event_in.attendee_ids:
            attendee = db.query(User).filter(User.id == attendee_id).first()
            if attendee:
                event.attendees.append(attendee)
    
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.put("/{event_id}", response_model=EventComplete)
def update_event(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    event_in: EventUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update an event.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if user is the organizer of the event
    if event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Update event fields
    update_data = event_in.dict(exclude_unset=True, exclude={"attendee_ids"})
    for field, value in update_data.items():
        setattr(event, field, value)
    
    # Update attendees if provided
    if event_in.attendee_ids is not None:
        # Clear current attendees (except organizer)
        event.attendees = [current_user]  # Keep organizer
        
        # Add new attendees
        for attendee_id in event_in.attendee_ids:
            if attendee_id != current_user.id:  # Skip organizer (already added)
                attendee = db.query(User).filter(User.id == attendee_id).first()
                if attendee:
                    event.attendees.append(attendee)
    
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/{event_id}", response_model=EventComplete)
def read_event(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get event by ID.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if user is the organizer or an attendee
    if event.organizer_id != current_user.id and current_user not in event.attendees:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return event


@router.delete("/{event_id}", response_model=EventSchema)
def delete_event(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete an event.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if user is the organizer of the event
    if event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(event)
    db.commit()
    return event


@router.post("/{event_id}/attend", response_model=EventWithAttendees)
def attend_event(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Current user attends an event.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if current_user in event.attendees:
        raise HTTPException(status_code=400, detail="Already attending this event")
    
    event.attendees.append(current_user)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.post("/{event_id}/cancel-attendance", response_model=EventWithAttendees)
def cancel_attendance(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Current user cancels attendance to an event.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Cannot cancel if you're the organizer
    if event.organizer_id == current_user.id:
        raise HTTPException(status_code=400, detail="Organizer cannot cancel attendance")
    
    if current_user not in event.attendees:
        raise HTTPException(status_code=400, detail="Not attending this event")
    
    event.attendees.remove(current_user)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/calendar/week", response_model=List[EventSchema])
def get_events_for_week(
    *,
    db: Session = Depends(get_db),
    date: datetime = Query(None),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get events for a specific week.
    """
    if not date:
        date = datetime.now()
    
    # Calculate start and end of the week
    start_of_week = date - timedelta(days=date.weekday())
    start_of_week = datetime(start_of_week.year, start_of_week.month, start_of_week.day, 0, 0, 0)
    end_of_week = start_of_week + timedelta(days=7)
    
    # Query events for the week
    events = db.query(Event).filter(
        ((Event.organizer_id == current_user.id) | (Event.attendees.any(id=current_user.id))),
        Event.start_time >= start_of_week,
        Event.start_time < end_of_week
    ).all()
    
    return events


@router.get("/calendar/month", response_model=List[EventSchema])
def get_events_for_month(
    *,
    db: Session = Depends(get_db),
    year: int = Query(None),
    month: int = Query(None),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get events for a specific month.
    """
    if not year or not month:
        now = datetime.now()
        year = now.year
        month = now.month
    
    # Calculate start and end of the month
    start_of_month = datetime(year, month, 1, 0, 0, 0)
    if month == 12:
        end_of_month = datetime(year + 1, 1, 1, 0, 0, 0)
    else:
        end_of_month = datetime(year, month + 1, 1, 0, 0, 0)
    
    # Query events for the month
    events = db.query(Event).filter(
        ((Event.organizer_id == current_user.id) | (Event.attendees.any(id=current_user.id))),
        Event.start_time >= start_of_month,
        Event.start_time < end_of_month
    ).all()
    
    return events


@router.get("/calendar/day", response_model=List[EventSchema])
def get_events_for_day(
    *,
    db: Session = Depends(get_db),
    date: datetime = Query(None),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get events for a specific day.
    """
    if not date:
        date = datetime.now()
    
    # Calculate start and end of the day
    start_of_day = datetime(date.year, date.month, date.day, 0, 0, 0)
    end_of_day = start_of_day + timedelta(days=1)
    
    # Query events for the day
    events = db.query(Event).filter(
        ((Event.organizer_id == current_user.id) | (Event.attendees.any(id=current_user.id))),
        Event.start_time >= start_of_day,
        Event.start_time < end_of_day
    ).all()
    
    return events