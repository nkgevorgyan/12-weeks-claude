"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Goal } from "@/lib/types"
import { goalsApi } from "@/lib/api"

interface DailyCheckInProps {
  goals: Goal[]
}

interface CheckInGoal extends Goal {
  notes: string
  todayValue: number
  submitting: boolean
}

export function DailyCheckIn({ goals }: DailyCheckInProps) {
  const { token } = useAuth()
  const { toast } = useToast()
  const [checkInGoals, setCheckInGoals] = useState<CheckInGoal[]>(
    goals.map(goal => ({
      ...goal,
      notes: "",
      todayValue: 0,
      submitting: false
    }))
  )

  const handleInputChange = (id: number, value: string) => {
    setCheckInGoals(
      checkInGoals.map((goal) => {
        if (goal.id === id) {
          const newValue = Math.max(0, Number.parseFloat(value) || 0)
          return { ...goal, todayValue: newValue }
        }
        return goal
      }),
    )
  }

  const handleNotesChange = (id: number, notes: string) => {
    setCheckInGoals(
      checkInGoals.map((goal) => {
        if (goal.id === id) {
          return { ...goal, notes }
        }
        return goal
      }),
    )
  }

  const handleSubmit = async (goal: CheckInGoal) => {
    if (!token) return
    
    // Update local state to show loading
    setCheckInGoals(
      checkInGoals.map((g) => {
        if (g.id === goal.id) {
          return { ...g, submitting: true }
        }
        return g
      })
    )
    
    try {
      // Submit the progress
      await goalsApi.logProgress(token, goal.id, {
        value: goal.todayValue,
        notes: goal.notes
      })
      
      // Update the goal in local state
      setCheckInGoals(
        checkInGoals.map((g) => {
          if (g.id === goal.id) {
            const newCurrentValue = g.current_value + g.todayValue
            const isCompleted = newCurrentValue >= g.target_value
            
            return { 
              ...g, 
              submitting: false,
              current_value: newCurrentValue,
              is_completed: isCompleted,
              // Clear the form
              todayValue: 0,
              notes: ""
            }
          }
          return g
        })
      )
      
      toast({
        title: "Progress logged",
        description: `Progress for ${goal.title} has been logged successfully.`,
      })
    } catch (error) {
      console.error("Failed to log progress:", error)
      
      // Reset submitting state
      setCheckInGoals(
        checkInGoals.map((g) => {
          if (g.id === goal.id) {
            return { ...g, submitting: false }
          }
          return g
        })
      )
      
      toast({
        title: "Failed to log progress",
        description: "There was an error logging your progress. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Filter to only show active goals
  const activeGoals = checkInGoals.filter(goal => !goal.is_completed)

  if (activeGoals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6">
        <h3 className="text-lg font-medium">No active goals</h3>
        <p className="text-sm text-muted-foreground mt-1">
          All your goals are completed for today. Great job!
        </p>
        <Button className="mt-4" asChild>
          <a href="/goals">Create a new goal</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {activeGoals.map((goal) => (
        <div key={goal.id} className="rounded-lg border p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-medium">{goal.title}</h3>
              <div className="mt-1 text-sm text-muted-foreground">
                <Badge variant="outline" className="mr-2">
                  {goal.team_id ? `Team Goal` : "Personal"}
                </Badge>
                Target: {goal.target_value} {goal.unit}
              </div>
            </div>
            <Badge variant="outline">
              {goal.current_value} / {goal.target_value} {goal.unit}
            </Badge>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor={`goal-${goal.id}`} className="text-sm font-medium">
                  Progress today
                </label>
                <span className="text-sm text-muted-foreground">
                  {goal.todayValue} {goal.unit}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id={`goal-${goal.id}`}
                  type="number"
                  min="0"
                  step="0.1"
                  value={goal.todayValue || ""}
                  onChange={(e) => handleInputChange(goal.id, e.target.value)}
                  disabled={goal.submitting}
                />
                <span className="text-sm">{goal.unit}</span>
              </div>
              <Progress 
                value={(goal.current_value / goal.target_value) * 100} 
                className="mt-2" 
              />
            </div>
            <div>
              <label htmlFor={`notes-${goal.id}`} className="mb-2 block text-sm font-medium">
                Notes (optional)
              </label>
              <Textarea
                id={`notes-${goal.id}`}
                placeholder="Add any notes or reflections about today's progress..."
                value={goal.notes}
                onChange={(e) => handleNotesChange(goal.id, e.target.value)}
                disabled={goal.submitting}
                className="resize-none"
              />
            </div>
            <Button 
              onClick={() => handleSubmit(goal)} 
              disabled={goal.submitting || goal.todayValue <= 0} 
              className="w-full"
            >
              {goal.submitting ? "Logging..." : "Log Progress"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}