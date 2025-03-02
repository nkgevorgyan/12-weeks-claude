from fastapi import APIRouter

from app.api.endpoints import auth, users, goals, teams, events

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(goals.router, prefix="/goals", tags=["goals"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
api_router.include_router(events.router, prefix="/events", tags=["events"])