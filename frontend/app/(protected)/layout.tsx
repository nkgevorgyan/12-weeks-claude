"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import AppSidebar from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to login if not authenticated and not currently loading
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])
  
  // Show nothing while checking authentication
  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full border-4 border-primary border-t-transparent h-12 w-12"></div>
      </div>
    )
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <div className="flex-1">{children}</div>
      </div>
    </SidebarProvider>
  )
}