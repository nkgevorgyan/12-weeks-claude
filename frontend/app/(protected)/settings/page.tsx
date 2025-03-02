"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { BellRing, Moon, Sun, Globe, Lock, Smartphone, LogOut, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("notifications")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

  // Notifications settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    goalReminders: true,
    teamUpdates: true,
    upcomingEvents: true,
    achievementMilestones: true,
    weeklyRecap: true
  })

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "system", // system, light, dark
    colorScheme: "default",
    fontSize: "medium"
  })

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public", // public, teams, private
    activitySharing: true,
    goalVisibility: "teams", // public, teams, private
    allowTeamInvites: true
  })

  const handleNotificationChange = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  const handleAppearanceChange = (setting: keyof typeof appearanceSettings, value: string) => {
    setAppearanceSettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  const handlePrivacyChange = (setting: keyof typeof privacySettings, value: any) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  const saveSettings = (settingType: string) => {
    // In a real app, you would save the settings to the backend
    toast({
      title: "Settings saved",
      description: `Your ${settingType} settings have been updated.`
    })
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const handleDeleteAccount = () => {
    // Account deletion logic would go here
    toast({
      title: "Account deleted",
      description: "Your account has been permanently deleted.",
      variant: "destructive"
    })
    logout()
    window.location.href = '/register'
  }

  return (
    <main className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your app preferences and account settings
          </p>
        </div>
        
        <Tabs defaultValue="notifications" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BellRing className="mr-2 h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={() => handleNotificationChange('emailNotifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Push Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={() => handleNotificationChange('pushNotifications')}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Notification Types</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Goal Reminders</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.goalReminders}
                      onCheckedChange={() => handleNotificationChange('goalReminders')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Team Updates</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.teamUpdates}
                      onCheckedChange={() => handleNotificationChange('teamUpdates')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Upcoming Events</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.upcomingEvents}
                      onCheckedChange={() => handleNotificationChange('upcomingEvents')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Achievement Milestones</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.achievementMilestones}
                      onCheckedChange={() => handleNotificationChange('achievementMilestones')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Weekly Recap</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.weeklyRecap}
                      onCheckedChange={() => handleNotificationChange('weeklyRecap')}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => saveSettings('notification')}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sun className="mr-2 h-5 w-5" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize how the app looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Theme</h3>
                    <RadioGroup 
                      value={appearanceSettings.theme}
                      onValueChange={(value) => handleAppearanceChange('theme', value)}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="theme-light" />
                        <Label htmlFor="theme-light" className="flex items-center">
                          <Sun className="mr-2 h-4 w-4" />
                          Light
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="theme-dark" />
                        <Label htmlFor="theme-dark" className="flex items-center">
                          <Moon className="mr-2 h-4 w-4" />
                          Dark
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system" id="theme-system" />
                        <Label htmlFor="theme-system" className="flex items-center">
                          <Globe className="mr-2 h-4 w-4" />
                          System
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Color Scheme</h3>
                    <Select 
                      value={appearanceSettings.colorScheme}
                      onValueChange={(value) => handleAppearanceChange('colorScheme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select color scheme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Font Size</h3>
                    <Select 
                      value={appearanceSettings.fontSize}
                      onValueChange={(value) => handleAppearanceChange('fontSize', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => saveSettings('appearance')}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Profile Visibility</h3>
                    <Select 
                      value={privacySettings.profileVisibility}
                      onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select profile visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public (Anyone can view)</SelectItem>
                        <SelectItem value="teams">Teams Only (Only team members)</SelectItem>
                        <SelectItem value="private">Private (Only you)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Activity Sharing</h3>
                      <p className="text-sm text-muted-foreground">Share your activity updates with team members</p>
                    </div>
                    <Switch 
                      checked={privacySettings.activitySharing}
                      onCheckedChange={(value) => handlePrivacyChange('activitySharing', value)}
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Goal Visibility</h3>
                    <Select 
                      value={privacySettings.goalVisibility}
                      onValueChange={(value) => handlePrivacyChange('goalVisibility', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public (Anyone can view)</SelectItem>
                        <SelectItem value="teams">Teams Only (Only team members)</SelectItem>
                        <SelectItem value="private">Private (Only you)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Team Invites</h3>
                      <p className="text-sm text-muted-foreground">Allow others to invite you to teams</p>
                    </div>
                    <Switch 
                      checked={privacySettings.allowTeamInvites}
                      onCheckedChange={(value) => handlePrivacyChange('allowTeamInvites', value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => saveSettings('privacy')}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Account Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account and connected services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <h3 className="font-medium">Account Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Email: {user?.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Username: {user?.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Account Status: <Badge variant="outline" className="ml-1">Active</Badge>
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Account Actions</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Log Out</p>
                      <p className="text-xs text-muted-foreground">Sign out of your account</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-destructive">Delete Account</p>
                      <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you absolutely sure?</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. Your account will be permanently deleted
                            along with all of your data including goals, teams, and progress history.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 py-4">
                          <p className="text-sm font-medium">
                            Please type <span className="font-bold">delete my account</span> to confirm:
                          </p>
                          <Input 
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="delete my account"
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmation !== "delete my account"}
                          >
                            Delete Account
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}