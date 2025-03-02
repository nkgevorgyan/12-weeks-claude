"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Video } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Event } from "@/lib/types"

interface UpcomingCallsProps {
  events: Event[]
}

// Helper function to format the date and time
const formatDateTime = (dateString: string): { date: string, time: string } => {
  const date = new Date(dateString)
  
  // For date, check if it's today, tomorrow, or show the actual date
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  let dateText
  if (date.toDateString() === today.toDateString()) {
    dateText = "Today"
  } else if (date.toDateString() === tomorrow.toDateString()) {
    dateText = "Tomorrow"
  } else {
    dateText = date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })
  }
  
  // Format time
  const timeText = date.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit'
  })
  
  return { date: dateText, time: timeText }
}

// Placeholder attendees - in a real app, these would come from the API
const mockAttendees = [
  { name: "Sarah Johnson", avatar: "/placeholder-user.jpg", initials: "SJ" },
  { name: "Alex Rivera", avatar: "/placeholder-user.jpg", initials: "AR" },
  { name: "John Doe", avatar: "/placeholder-user.jpg", initials: "JD" },
  { name: "Michael Chen", avatar: "/placeholder-user.jpg", initials: "MC" },
  { name: "Emily Wong", avatar: "/placeholder-user.jpg", initials: "EW" },
  { name: "David Kim", avatar: "/placeholder-user.jpg", initials: "DK" },
]

export function UpcomingCalls({ events }: UpcomingCallsProps) {
  // Filter to only get "call" type events and sort by date
  const callEvents = events
    .filter(event => event.event_type === "call")
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  
  if (callEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">No upcoming calls scheduled</p>
        <Button variant="outline" size="sm" className="mt-4">
          Schedule a Call
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {callEvents.slice(0, 3).map((event) => {
        const { date, time } = formatDateTime(event.start_time)
        const endTime = new Date(event.end_time).toLocaleTimeString('en-US', { 
          hour: 'numeric',
          minute: '2-digit'
        })
        
        // Get random attendees for the demo (3-5 people)
        const numAttendees = Math.floor(Math.random() * 3) + 3
        const attendees = mockAttendees.slice(0, numAttendees)
        
        return (
          <div key={event.id} className="rounded-lg border p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {event.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {date}, {time} - {endTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {attendees.map((attendee, index) => (
                    <Avatar key={index} className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={attendee.avatar} alt={attendee.name} />
                      <AvatarFallback className="text-[10px]">{attendee.initials}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{attendees.length} attendees</span>
              </div>
              <Button size="sm" className="mt-2">
                <Video className="mr-2 h-4 w-4" />
                Join Call
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}