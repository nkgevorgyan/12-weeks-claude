"use client"

import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Star,
  MessageSquare,
  Calendar,
  BarChart2
} from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { goalsApi, teamsApi, eventsApi } from "@/lib/api"
import { Goal, Event, Team } from "@/lib/types"
import { DailyCheckIn } from "@/components/daily-check-in"
import { TeamActivity } from "@/components/team-activity"
import { WeeklyProgress } from "@/components/weekly-progress"
import { UpcomingCalls } from "@/components/upcoming-calls"

export default function DashboardPage() {
  const { user, token } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [goals, setGoals] = useState<Goal[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return
      
      setIsLoading(true)
      try {
        // Fetch goals, upcoming events, and teams
        const [goalsData, eventsData, teamsData] = await Promise.all([
          goalsApi.getGoals(token),
          eventsApi.getEvents(token),
          teamsApi.getTeams(token)
        ])
        
        setGoals(goalsData)
        setEvents(eventsData)
        setTeams(teamsData)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token])

  // Calculate stats
  const totalGoals = goals.length
  const completedGoals = goals.filter(goal => goal.is_completed).length
  const activeGoals = totalGoals - completedGoals
  
  // Find the next upcoming event (if any)
  const upcomingEvent = events.sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )[0]
  
  const nextCallDate = upcomingEvent 
    ? new Date(upcomingEvent.start_time).toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    : 'No upcoming calls'

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.full_name || user?.username}! You have {activeGoals} active goals and {events.length} upcoming calls.
          </p>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">My Goals</TabsTrigger>
            <TabsTrigger value="teams">My Teams</TabsTrigger>
            <TabsTrigger value="calls">Calls</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                  <div className="rounded-full bg-primary/10 p-1 text-primary">
                    <LayoutDashboard className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeGoals}/{totalGoals}</div>
                  <p className="text-xs text-muted-foreground">
                    {completedGoals > 0 
                      ? `${completedGoals} goals completed` 
                      : `Track your progress daily`}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <div className="rounded-full bg-primary/10 p-1 text-primary">
                    <Star className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user?.current_streak || 0} days</div>
                  <p className="text-xs text-muted-foreground">Your longest streak is {user?.longest_streak || 0} days</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Calls</CardTitle>
                  <div className="rounded-full bg-primary/10 p-1 text-primary">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{events.length}</div>
                  <p className="text-xs text-muted-foreground">Next call: {nextCallDate}</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Daily Check-In</CardTitle>
                  <CardDescription>Log your progress for today on each of your active goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin rounded-full border-4 border-primary border-t-transparent h-8 w-8"></div>
                    </div>
                  ) : (
                    <DailyCheckIn goals={goals.filter(goal => !goal.is_completed)} />
                  )}
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Team Activity</CardTitle>
                  <CardDescription>Recent updates from your accountability partners</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin rounded-full border-4 border-primary border-t-transparent h-8 w-8"></div>
                    </div>
                  ) : (
                    <TeamActivity />
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                  <CardDescription>Your goal progress over the past 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin rounded-full border-4 border-primary border-t-transparent h-8 w-8"></div>
                    </div>
                  ) : (
                    <WeeklyProgress goals={goals} />
                  )}
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Upcoming Calls</CardTitle>
                  <CardDescription>Scheduled check-ins with your teams</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin rounded-full border-4 border-primary border-t-transparent h-8 w-8"></div>
                    </div>
                  ) : (
                    <UpcomingCalls events={events} />
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/calendar">
                      <Calendar className="mr-2 h-4 w-4" />
                      View Calendar
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Additional tab content would go here */}
          <TabsContent value="goals" className="space-y-4">
            {/* Goals tab content */}
          </TabsContent>
          
          <TabsContent value="teams" className="space-y-4">
            {/* Teams tab content */}
          </TabsContent>
          
          <TabsContent value="calls" className="space-y-4">
            {/* Calls tab content */}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}