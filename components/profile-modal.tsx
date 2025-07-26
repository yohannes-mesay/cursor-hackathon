"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Settings, 
  LogOut, 
  Edit3, 
  Save,
  Mail,
  Building,
  Tag,
  HelpCircle,
  Coins
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface ProfileModalProps {
  children: React.ReactNode
}

export function ProfileModal({ children }: ProfileModalProps) {
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, userProfile, signOut } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    startup_name: userProfile?.startup_name || "",
    tagline: userProfile?.tagline || "",
    stage: userProfile?.stage || "idea",
    areas_of_help: userProfile?.areas_of_help || []
  })

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAreasOfHelpChange = (value: string) => {
    const areas = value.split(",").map(area => area.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, areas_of_help: areas }))
  }

  const handleSaveProfile = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: formData.name,
          startup_name: formData.startup_name || null,
          tagline: formData.tagline || null,
          stage: formData.stage,
          areas_of_help: formData.areas_of_help
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
      setIsEditing(false)
      // Optionally trigger a refresh of user data here
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setOpen(false)
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile</span>
          </DialogTitle>
          <DialogDescription>
            Manage your profile information and account settings.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                  {userProfile?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{userProfile?.name || "User"}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <div className="flex items-center mt-2">
                  <Coins className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">{userProfile?.token_balance || 0} tokens</span>
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="startup_name">Startup Name (Optional)</Label>
                  <Input
                    id="startup_name"
                    value={formData.startup_name}
                    onChange={(e) => handleInputChange("startup_name", e.target.value)}
                    placeholder="Your startup name"
                  />
                </div>

                <div>
                  <Label htmlFor="tagline">Tagline (Optional)</Label>
                  <Textarea
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => handleInputChange("tagline", e.target.value)}
                    placeholder="Brief description of your startup"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="stage">Stage</Label>
                  <Select value={formData.stage} onValueChange={(value) => handleInputChange("stage", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="mvp">MVP</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="scaling">Scaling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="areas_of_help">Areas of Help (comma separated)</Label>
                  <Input
                    id="areas_of_help"
                    value={formData.areas_of_help.join(", ")}
                    onChange={(e) => handleAreasOfHelpChange(e.target.value)}
                    placeholder="funding, mentorship, technical, marketing"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleSaveProfile} disabled={loading} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Information</Label>
                  <div className="mt-2 space-y-2">
                    {userProfile?.startup_name && (
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{userProfile.startup_name}</span>
                      </div>
                    )}
                    {userProfile?.tagline && (
                      <div className="flex items-start space-x-2">
                        <Tag className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span className="text-sm">{userProfile.tagline}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{user?.email}</span>
                    </div>
                  </div>
                </div>

                {userProfile?.areas_of_help && userProfile.areas_of_help.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Looking for help with:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {userProfile.areas_of_help.map((area) => (
                        <Badge key={area} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Account Information</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Email: {user?.email}</div>
                  <div>Member since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</div>
                  <div>Token Balance: {userProfile?.token_balance || 0}</div>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-800 mb-2">Danger Zone</h4>
                <p className="text-sm text-red-600 mb-4">
                  Logging out will end your current session.
                </p>
                <Button onClick={handleLogout} variant="destructive" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 