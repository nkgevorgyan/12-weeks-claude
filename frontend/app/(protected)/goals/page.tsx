"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, BarChart2, Filter, ChevronDown } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Team, Goal } from "@/lib/types"
import { goalsApi, teamsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function GoalsPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [goals, setGoals] = useState<Goal[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_value: 0,
    unit: "",
    team_id: null as number | null,
    is_recurring: false,
    frequency: "daily",
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return
      
      setIsLoading(true)
      try {
        // Fetch goals and teams
        const [goalsData, teamsData] = await Promise.all([
          goalsApi.getGoals(token),
          teamsApi.getTeams(token)
        ])
        
        setGoals(goalsData)
        setTeams(teamsData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast({
          title: "Error",
          description: "There was an error loading your goals.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token, toast])

  const filteredGoals = goals.filter((goal) => {
    if (activeTab === "all") return true
    if (activeTab === "completed") return goal.is_completed
    return !goal.is_completed
  })

  const totalGoals = goals.length
  const completedGoals = goals.filter((goal) => goal.is_completed).length
  const inProgressGoals = totalGoals - completedGoals

  // Get goals that are due soon (in 3 days or less)
  const upcomingDeadlines = goals
    .filter(goal => !goal.is_completed && goal.target_date)
    .filter(goal => {
      const targetDate = new Date(goal.target_date!)
      const now = new Date()
      const differenceInDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 3600 * 24))
      return differenceInDays <= 3 && differenceInDays >= 0
    })
    .sort((a, b) => new Date(a.target_date!).getTime() - new Date(b.target_date!).getTime())

  const nextDeadline = upcomingDeadlines.length > 0 
    ? new Date(upcomingDeadlines[0].target_date!).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      })
    : "No upcoming deadlines"

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement
      setFormData(prev => ({ ...prev, [name]: target.checked }))
    } else if (name === 'team_id') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value === '' ? null : parseInt(value) 
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    
    try {
      const newGoal = await goalsApi.createGoal(token, formData)
      setGoals(prev => [...prev, newGoal])
      
      toast({
        title: "Goal created",
        description: "Your new goal has been created successfully.",
      })
      
      // Reset form and close dialog
      setFormData({
        title: "",
        description: "",
        target_value: 0,
        unit: "",
        team_id: null,
        is_recurring: false,
        frequency: "daily",
      })
      setDialogOpen(false)
    } catch (error) {
      console.error("Failed to create goal:", error)
      toast({
        title: "Error",
        description: "There was an error creating your goal.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteGoal = async (goalId: number) => {
    if (!token) return
    
    if (confirm("Are you sure you want to delete this goal?")) {
      try {
        await goalsApi.deleteGoal(token, goalId)
        setGoals(prev => prev.filter(goal => goal.id !== goalId))
        
        toast({
          title: "Goal deleted",
          description: "Your goal has been deleted successfully.",
        })
      } catch (error) {
        console.error("Failed to delete goal:", error)
        toast({
          title: "Error",
          description: "There was an error deleting your goal.",
          variant: "destructive"
        })
      }
    }
  }

  const calculateDaysLeft = (targetDate: string) => {
    const target = new Date(targetDate)
    const now = new Date()
    const differenceInDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 3600 * 24))
    return differenceInDays > 0 ? `${differenceInDays} days left` : "Due today"
  }

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Goals</h1>
          <div className="flex space-x-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add New Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Goal</DialogTitle>
                  <DialogDescription>Create a new goal to track your progress.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input 
                        id="title" 
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="col-span-3" 
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Input 
                        id="description" 
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="col-span-3" 
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="target_value" className="text-right">
                        Target
                      </Label>
                      <Input 
                        id="target_value" 
                        name="target_value"
                        type="number" 
                        value={formData.target_value || ""}
                        onChange={handleChange}
                        className="col-span-3" 
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="unit" className="text-right">
                        Unit
                      </Label>
                      <Input 
                        id="unit" 
                        name="unit"
                        placeholder="miles, pages, etc."
                        value={formData.unit}
                        onChange={handleChange}
                        className="col-span-3" 
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="team_id" className="text-right">
                        Team
                      </Label>
                      <select 
                        id="team_id" 
                        name="team_id"
                        value={formData.team_id || ""}
                        onChange={handleChange}
                        className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Personal Goal</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="text-right">
                        <Label htmlFor="is_recurring">
                          Recurring
                        </Label>
                      </div>
                      <div className="col-span-3 flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="is_recurring" 
                          name="is_recurring"
                          checked={formData.is_recurring}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="is_recurring">
                          This is a recurring goal
                        </Label>
                      </div>
                    </div>
                    {formData.is_recurring && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="frequency" className="text-right">
                          Frequency
                        </Label>
                        <select 
                          id="frequency" 
                          name="frequency"
                          value={formData.frequency}
                          onChange={handleChange}
                          className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Goal</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter Goals</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab("all")}>
                  All Goals
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("in-progress")}>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("completed")}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  All Teams
                </DropdownMenuItem>
                {teams.map(team => (
                  <DropdownMenuItem key={team.id}>
                    {team.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
  
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGoals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedGoals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressGoals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Deadline</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{
                upcomingDeadlines.length > 0 
                  ? upcomingDeadlines.length > 1 
                    ? `${upcomingDeadlines.length} goals` 
                    : "1 goal"
                  : "None"
              }</div>
              <p className="text-xs text-muted-foreground">{nextDeadline}</p>
            </CardContent>
          </Card>
        </div>
  
        <Tabs value={activeTab} className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Goals</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{activeTab === "all" ? "All Goals" : activeTab === "in-progress" ? "In Progress Goals" : "Completed Goals"}</CardTitle>
                <CardDescription>View and manage your goals across different teams</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full border-4 border-primary border-t-transparent h-12 w-12"></div>
                  </div>
                ) : filteredGoals.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">No goals found</p>
                    <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Create your first goal
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {filteredGoals.map((goal) => (
                        <div key={goal.id} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{goal.title}</h3>
                              <Badge>
                                {goal.team_id ? teams.find(t => t.id === goal.team_id)?.name || "Team" : "Personal"}
                              </Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit Goal</DropdownMenuItem>
                                <DropdownMenuItem>View History</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDeleteGoal(goal.id)}
                                >
                                  Delete Goal
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progress: {goal.current_value}/{goal.target_value} {goal.unit}</span>
                              <span className="text-muted-foreground">
                                {Math.round((goal.current_value / goal.target_value) * 100)}%
                              </span>
                            </div>
                            <Progress value={(goal.current_value / goal.target_value) * 100} className="mt-1" />
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              <span>{goal.target_date ? calculateDaysLeft(goal.target_date) : 
                                goal.is_recurring ? `Recurring ${goal.frequency}` : "No deadline"}</span>
                            </div>
                            <Button size="sm" disabled={goal.is_completed}>
                              {goal.is_completed ? "Completed" : "Log Progress"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}