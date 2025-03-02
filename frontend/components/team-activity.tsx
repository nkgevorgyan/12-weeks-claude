"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ThumbsUp } from "lucide-react"

// Define types for team activity data
type ActivityType = "completed_goal" | "missed_goal" | "comment" | "joined_team"

interface TeamMember {
  id: number
  name: string
  avatar: string
  initials: string
}

interface TeamActivity {
  id: number
  user: TeamMember
  team: string
  team_id: number
  activity_type: ActivityType
  goal_title?: string
  progress?: string
  comment?: string
  time: string
  likes: number
  comments: number
  liked_by_user: boolean
}

// Mock data for the component
const mockActivities: TeamActivity[] = [
  {
    id: 1,
    user: {
      id: 2,
      name: "Sarah Johnson",
      avatar: "/placeholder-user.jpg",
      initials: "SJ",
    },
    team: "Fitness Warriors",
    team_id: 1,
    activity_type: "completed_goal",
    goal_title: "Run 100 miles this month",
    progress: "4.2 miles today",
    time: "2 hours ago",
    likes: 3,
    comments: 1,
    liked_by_user: true,
  },
  {
    id: 2,
    user: {
      id: 3,
      name: "Michael Chen",
      avatar: "/placeholder-user.jpg",
      initials: "MC",
    },
    team: "Coding Club",
    team_id: 2,
    activity_type: "completed_goal",
    goal_title: "Complete 5 coding challenges per week",
    progress: "2 challenges today",
    time: "4 hours ago",
    likes: 2,
    comments: 0,
    liked_by_user: false,
  },
  {
    id: 3,
    user: {
      id: 4,
      name: "Alex Rivera",
      avatar: "/placeholder-user.jpg",
      initials: "AR",
    },
    team: "Fitness Warriors",
    team_id: 1,
    activity_type: "missed_goal",
    goal_title: "Workout 5 days a week",
    progress: "Will make it up tomorrow",
    time: "6 hours ago",
    likes: 1,
    comments: 2,
    liked_by_user: false,
  },
  {
    id: 4,
    user: {
      id: 5,
      name: "Emily Wong",
      avatar: "/placeholder-user.jpg",
      initials: "EW",
    },
    team: "Coding Club",
    team_id: 2,
    activity_type: "comment",
    goal_title: "Complete 5 coding challenges per week",
    comment: "Great progress! Have you tried the new algorithm challenges?",
    time: "Yesterday",
    likes: 0,
    comments: 0,
    liked_by_user: false,
  },
  {
    id: 5,
    user: {
      id: 6,
      name: "David Kim",
      avatar: "/placeholder-user.jpg",
      initials: "DK",
    },
    team: "Fitness Warriors",
    team_id: 1,
    activity_type: "joined_team",
    time: "2 days ago",
    likes: 5,
    comments: 2,
    liked_by_user: false,
  },
];

export function TeamActivity() {
  const [activities, setActivities] = useState<TeamActivity[]>(mockActivities)

  // Toggle like on activity
  const toggleLike = (activityId: number) => {
    setActivities(prev => 
      prev.map(activity => {
        if (activity.id === activityId) {
          const newLikedState = !activity.liked_by_user
          return {
            ...activity,
            liked_by_user: newLikedState,
            likes: newLikedState 
              ? activity.likes + 1 
              : activity.likes - 1
          }
        }
        return activity
      })
    )
  }

  // Get appropriate message based on activity type
  const getActivityMessage = (activity: TeamActivity) => {
    switch (activity.activity_type) {
      case "completed_goal":
        return "completed their daily goal"
      case "missed_goal":
        return "missed their daily goal"
      case "comment":
        return "commented on your goal"
      case "joined_team":
        return "joined the team"
      default:
        return "posted an update"
    }
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3 border-b pb-4 last:border-0 last:pb-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1 text-sm">
              <span className="font-medium">{activity.user.name}</span>
              <span className="text-muted-foreground">{getActivityMessage(activity)}</span>
              <Badge variant="outline" className="ml-1">
                {activity.team}
              </Badge>
            </div>
            
            {activity.goal_title && (
              <p className="text-sm font-medium">{activity.goal_title}</p>
            )}
            
            {activity.progress && (
              <p className="text-sm text-muted-foreground">{activity.progress}</p>
            )}
            
            {activity.comment && (
              <p className="text-sm italic text-muted-foreground">"{activity.comment}"</p>
            )}
            
            <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
              <span>{activity.time}</span>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-6 w-6 ${activity.liked_by_user ? 'text-primary' : ''}`}
                  onClick={() => toggleLike(activity.id)}
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <span>{activity.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MessageSquare className="h-3 w-3" />
                </Button>
                <span>{activity.comments}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full">
        View More
      </Button>
    </div>
  )
}