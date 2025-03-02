# Accountability App

An application for goal tracking, habit building, and team accountability. Build healthy habits and reach your goals with help from your team.

## Features

- **Goal Tracking**: Create and track progress on personal and team goals
- **Team Collaboration**: Form accountability teams and monitor team progress
- **Daily Check-ins**: Log your progress daily and maintain your streak
- **Calendar**: Schedule and join accountability calls with team members

## Tech Stack

- **Frontend**: Next.js with TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: Python FastAPI with SQLAlchemy ORM
- **Database**: PostgreSQL
- **Authentication**: JWT-based authentication

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- Docker and Docker Compose

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/accountability-app.git
   cd accountability-app
   ```

2. Create a `.env` file in the root directory with the following content:
   ```
   # Backend settings
   SECRET_KEY=your-secret-key-here
   ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days
   BACKEND_CORS_ORIGINS=["http://localhost:3000"]

   # Database settings
   POSTGRES_SERVER=db
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=accountability

   # Frontend settings
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

3. Start the application with Docker Compose:
   ```bash
   docker-compose up
   ```

4. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Running Separately (Development)

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start the backend server
uvicorn main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/test-token` - Test authentication token

### Users
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update current user
- `POST /api/v1/users` - Create user (register)

### Goals
- `GET /api/v1/goals` - List user goals
- `POST /api/v1/goals` - Create a new goal
- `GET /api/v1/goals/{goal_id}` - Get goal details
- `PUT /api/v1/goals/{goal_id}` - Update a goal
- `DELETE /api/v1/goals/{goal_id}` - Delete a goal
- `POST /api/v1/goals/{goal_id}/progress` - Log progress for a goal

### Teams
- `GET /api/v1/teams` - List user teams
- `POST /api/v1/teams` - Create a new team
- `GET /api/v1/teams/{team_id}` - Get team details
- `PUT /api/v1/teams/{team_id}` - Update a team
- `DELETE /api/v1/teams/{team_id}` - Delete a team
- `POST /api/v1/teams/{team_id}/members` - Add a member to a team

### Events
- `GET /api/v1/events` - List user events
- `POST /api/v1/events` - Create a new event
- `GET /api/v1/events/{event_id}` - Get event details
- `PUT /api/v1/events/{event_id}` - Update an event
- `DELETE /api/v1/events/{event_id}` - Delete an event
- `GET /api/v1/events/calendar/week` - Get events for a specific week
- `GET /api/v1/events/calendar/month` - Get events for a specific month

## License

This project is licensed under the MIT License - see the LICENSE file for details.