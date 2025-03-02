"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { 
  Home, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Plus, 
  Star, 
  Settings, 
  Search,
  LogOut,
  Bell
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"

export default function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  
  // Extract initials from user's full name or username
  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    }
    return user?.username?.substring(0, 2).toUpperCase() || 'U';
  };
  
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };
  
  return (
    <>
      <Sidebar className="hidden md:flex">
        <SidebarHeader className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Star className="h-5 w-5 text-primary" />
            <span>Accountability</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/" || pathname === "/dashboard"}>
                    <Link href="/dashboard">
                      <Home className="h-4 w-4" />
                      <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/goals"}>
                    <Link href="/goals">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>My Goals</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/calendar"}>
                    <Link href="/calendar">
                      <Calendar className="h-4 w-4" />
                      <span>Calendar</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Teams</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/teams/fitness-warriors"}>
                    <Link href="/teams/fitness-warriors">
                      <Users className="h-4 w-4" />
                      <span>Fitness Warriors</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/teams/coding-club"}>
                    <Link href="/teams/coding-club">
                      <Users className="h-4 w-4" />
                      <span>Coding Club</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/teams/join"}>
                    <Link href="/teams/join">
                      <Plus className="h-4 w-4" />
                      <span>Join New Team</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar || ""} alt={user?.username || "User"} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user?.full_name || user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
      </Sidebar>
      {/* Mobile header */}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 md:hidden">
        <SidebarTrigger className="md:hidden" />
        <div className="flex flex-1 items-center gap-4 md:gap-8">
          <div className="md:hidden">
            <div className="flex items-center gap-2 font-semibold">
              <Star className="h-5 w-5 text-primary" />
              <span>Accountability</span>
            </div>
          </div>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Input 
              placeholder="Search..." 
              className="rounded-full bg-muted pl-8 md:w-[200px] lg:w-[280px]" 
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 opacity-50">
              <Search className="h-4 w-4" />
            </div>
          </div>
          <Button variant="outline" size="icon" className="rounded-full">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              3
            </span>
          </Button>
          <div className="md:hidden">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || ""} alt={user?.username || "User"} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
    </>
  )
}