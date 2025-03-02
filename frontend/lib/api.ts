import { User, Goal, Team, Event } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Helper function to handle API responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    // Try to get error message from the response
    try {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'API request failed');
    } catch (e) {
      throw new Error(`API request failed with status ${response.status}`);
    }
  }
  return response.json();
}

// Authentication API
export const authApi = {
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  register: async (userData: any) => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  getCurrentUser: async (token: string) => {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};

// Users API
export const usersApi = {
  updateProfile: async (token: string, userData: Partial<User>) => {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },
  
  getUserWithTeams: async (token: string) => {
    const response = await fetch(`${API_URL}/users/with-teams`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};

// Goals API
export const goalsApi = {
  getGoals: async (token: string) => {
    const response = await fetch(`${API_URL}/goals`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getGoal: async (token: string, goalId: number) => {
    const response = await fetch(`${API_URL}/goals/${goalId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  createGoal: async (token: string, goalData: Partial<Goal>) => {
    const response = await fetch(`${API_URL}/goals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goalData),
    });
    return handleResponse(response);
  },

  updateGoal: async (token: string, goalId: number, goalData: Partial<Goal>) => {
    const response = await fetch(`${API_URL}/goals/${goalId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goalData),
    });
    return handleResponse(response);
  },

  deleteGoal: async (token: string, goalId: number) => {
    const response = await fetch(`${API_URL}/goals/${goalId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  logProgress: async (token: string, goalId: number, progressData: any) => {
    const response = await fetch(`${API_URL}/goals/${goalId}/progress`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progressData),
    });
    return handleResponse(response);
  },

  getGoalProgress: async (token: string, goalId: number) => {
    const response = await fetch(`${API_URL}/goals/${goalId}/progress`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};

// Teams API
export const teamsApi = {
  getTeams: async (token: string) => {
    const response = await fetch(`${API_URL}/teams`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getTeam: async (token: string, teamId: number) => {
    const response = await fetch(`${API_URL}/teams/${teamId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  createTeam: async (token: string, teamData: Partial<Team>) => {
    const response = await fetch(`${API_URL}/teams`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });
    return handleResponse(response);
  },

  updateTeam: async (token: string, teamId: number, teamData: Partial<Team>) => {
    const response = await fetch(`${API_URL}/teams/${teamId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });
    return handleResponse(response);
  },

  deleteTeam: async (token: string, teamId: number) => {
    const response = await fetch(`${API_URL}/teams/${teamId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getTeamMembers: async (token: string, teamId: number) => {
    const response = await fetch(`${API_URL}/teams/${teamId}/members`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  addTeamMember: async (token: string, teamId: number, userId: number) => {
    const response = await fetch(`${API_URL}/teams/${teamId}/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    return handleResponse(response);
  },

  removeTeamMember: async (token: string, teamId: number, userId: number) => {
    const response = await fetch(`${API_URL}/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getTeamGoals: async (token: string, teamId: number) => {
    const response = await fetch(`${API_URL}/teams/${teamId}/goals`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getTeamEvents: async (token: string, teamId: number) => {
    const response = await fetch(`${API_URL}/teams/${teamId}/events`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};

// Events API
export const eventsApi = {
  getEvents: async (token: string) => {
    const response = await fetch(`${API_URL}/events`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getEvent: async (token: string, eventId: number) => {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  createEvent: async (token: string, eventData: Partial<Event>) => {
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    return handleResponse(response);
  },

  updateEvent: async (token: string, eventId: number, eventData: Partial<Event>) => {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    return handleResponse(response);
  },

  deleteEvent: async (token: string, eventId: number) => {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  attendEvent: async (token: string, eventId: number) => {
    const response = await fetch(`${API_URL}/events/${eventId}/attend`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  cancelAttendance: async (token: string, eventId: number) => {
    const response = await fetch(`${API_URL}/events/${eventId}/cancel-attendance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getEventsForWeek: async (token: string, date?: string) => {
    const url = date ? `${API_URL}/events/calendar/week?date=${date}` : `${API_URL}/events/calendar/week`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getEventsForMonth: async (token: string, year?: number, month?: number) => {
    let url = `${API_URL}/events/calendar/month`;
    if (year && month) {
      url += `?year=${year}&month=${month}`;
    }
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getEventsForDay: async (token: string, date?: string) => {
    const url = date ? `${API_URL}/events/calendar/day?date=${date}` : `${API_URL}/events/calendar/day`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};