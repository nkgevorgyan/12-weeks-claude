// User related types
export interface User {
    id: number;
    email: string;
    username: string;
    full_name?: string;
    is_active: boolean;
    current_streak: number;
    longest_streak: number;
    avatar?: string;
  }
  
  export interface UserWithTeams extends User {
    teams: Team[];
  }
  
  // Team related types
  export interface Team {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    created_by_id: number;
    cycle_name?: string;
    cycle_start_date?: string;
    cycle_end_date?: string;
  }
  
  export interface TeamWithMembers extends Team {
    members: User[];
  }
  
  export interface TeamWithGoals extends Team {
    goals: Goal[];
  }
  
  export interface TeamWithEvents extends Team {
    events: Event[];
  }
  
  export interface TeamComplete extends Team {
    members: User[];
    goals: Goal[];
    events: Event[];
  }
  
  // Goal related types
  export interface Goal {
    id: number;
    title: string;
    description?: string;
    user_id: number;
    team_id?: number;
    target_value: number;
    current_value: number;
    unit: string;
    created_at: string;
    target_date?: string;
    completed_at?: string;
    is_completed: boolean;
    is_recurring: boolean;
    frequency?: string;
  }
  
  export interface GoalProgress {
    id: number;
    goal_id: number;
    value: number;
    notes?: string;
    logged_at: string;
  }
  
  export interface GoalWithProgress extends Goal {
    progress_logs: GoalProgress[];
  }
  
  // Event related types
  export interface Event {
    id: number;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    created_at: string;
    organizer_id: number;
    team_id?: number;
    event_type: string;
    location?: string;
    meeting_link?: string;
  }
  
  export interface EventWithAttendees extends Event {
    attendees: User[];
  }
  
  export interface EventComplete extends Event {
    organizer: User;
    team?: Team;
    attendees: User[];
  }
  
  // Authentication related types
  export interface AuthToken {
    access_token: string;
    token_type: string;
  }