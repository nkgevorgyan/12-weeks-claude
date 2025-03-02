"use client"

import { useMemo } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Goal } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"

interface WeeklyProgressProps {
  goals: Goal[]
}

// Helper function to get the past 7 days
const getPast7Days = () => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push({
      date,
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: date.toISOString().split('T')[0]
    })
  }
  return days
}

export function WeeklyProgress({ goals }: WeeklyProgressProps) {
  // Filter to only include active goals with recent progress
  const activeGoals = goals.filter(goal => 
    !goal.is_completed || 
    (goal.is_completed && new Date(goal.completed_at!).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)
  )

  // Get past 7 days for chart
  const days = getPast7Days()
  
  // Mock progress data for visualization
  // In a real implementation, this would come from the API's progress logs
  const mockProgressData = useMemo(() => {
    return days.map(day => {
      // Create a data point for each day
      const dataPoint: Record<string, any> = {
        name: day.name,
        date: day.fullDate
      }
      
      // Add a random progress value for each goal
      activeGoals.forEach(goal => {
        // Use goal ID as key to ensure uniqueness
        const key = `goal_${goal.id}`
        
        // For completed goals, show progress on the completion day
        if (goal.is_completed && goal.completed_at) {
          const completedDate = new Date(goal.completed_at).toISOString().split('T')[0]
          dataPoint[key] = completedDate === day.fullDate ? 
            (Math.random() * 0.3 + 0.7) * goal.target_value : // High progress on completion day
            Math.random() * 0.5 * goal.target_value // Some progress on other days
        } else {
          // For active goals, show random progress
          dataPoint[key] = Math.random() * goal.target_value
          
          // Ensure the most recent day has the current progress value
          if (day.fullDate === days[days.length - 1].fullDate) {
            dataPoint[key] = goal.current_value
          }
        }
      })
      
      return dataPoint
    })
  }, [activeGoals, days])
  
  // Generate colors for each goal
  const goalColors = {
    goal_1: "#4f46e5", // indigo
    goal_2: "#0ea5e9", // sky
    goal_3: "#10b981", // emerald
    goal_4: "#f59e0b", // amber
    goal_5: "#ef4444", // red
  }
  
  if (activeGoals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center">
        <p className="text-muted-foreground">No active goals to display</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mockProgressData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => {
              // Extract the goal ID from the name (goal_1 -> 1)
              const goalId = parseInt(name.split('_')[1])
              const goal = activeGoals.find(g => g.id === goalId)
              // Format the value with the goal unit
              return [`${value.toFixed(1)} ${goal?.unit || ''}`, goal?.title || name]
            }}
          />
          <Legend 
            formatter={(value) => {
              // Extract the goal ID from the value (goal_1 -> 1)
              const goalId = parseInt(value.split('_')[1])
              const goal = activeGoals.find(g => g.id === goalId)
              // Return the goal title
              return goal?.title || value
            }}
          />
          {activeGoals.map((goal, index) => (
            <Bar 
              key={goal.id} 
              dataKey={`goal_${goal.id}`} 
              name={`goal_${goal.id}`}
              fill={goalColors[`goal_${index + 1}` as keyof typeof goalColors] || "#8884d8"}
              radius={[4, 4, 0, 0]} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}