"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Send, 
  Video, 
  Phone, 
  Users, 
  MessageSquare, 
  FileText, 
  Share2,
  Mic,
  MicOff,
  VideoOff,
  Settings
} from "lucide-react"
import { useSocket } from "@/contexts/socket-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { LiveChat } from "./live-chat"
import { VideoCall } from "./video-call"
import { CollaborativeEditor } from "./collaborative-editor"

interface OnlineUser {
  id: string
  name: string
  avatar?: string
  status: 'online' | 'away' | 'busy'
}

export function CollaborationHub() {
  const [activeTab, setActiveTab] = useState("chat")
  const [selectedRoom, setSelectedRoom] = useState("general")
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [isInCall, setIsInCall] = useState(false)
  const { socket, isConnected } = useSocket()
  const { user, userProfile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (socket && isConnected) {
      // Join the general room by default
      socket.emit('join-room', 'general')

      // Listen for online users updates
      socket.on('users-online', (users) => {
        setOnlineUsers(users.map((userId: string) => ({
          id: userId,
          name: `User ${userId.slice(0, 8)}`,
          status: 'online' as const
        })))
      })

      return () => {
        socket.off('users-online')
      }
    }
  }, [socket, isConnected])

  const startVideoCall = () => {
    if (!isInCall) {
      setIsInCall(true)
      setActiveTab("video")
      toast({
        title: "Video Call Started",
        description: "You can now collaborate face-to-face!",
      })
    }
  }

  const endVideoCall = () => {
    setIsInCall(false)
    toast({
      title: "Video Call Ended",
      description: "Thanks for collaborating!",
    })
  }

  const connectionStatus = isConnected ? (
    <Badge variant="outline" className="text-green-600 border-green-200">
      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
      Connected
    </Badge>
  ) : (
    <Badge variant="outline" className="text-red-600 border-red-200">
      <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
      Disconnected
    </Badge>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Collaboration Hub</h2>
          <p className="text-gray-600">Connect and collaborate in real-time</p>
        </div>
        <div className="flex items-center space-x-4">
          {connectionStatus}
          <Badge variant="secondary">
            <Users className="h-4 w-4 mr-1" />
            {onlineUsers.length} online
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Online Users Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Users className="h-5 w-5 mr-2" />
              Online Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {onlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          user.status === 'online' ? 'bg-green-500' : 
                          user.status === 'away' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-xs text-gray-500 capitalize">{user.status}</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={startVideoCall}>
                        <Video className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {onlineUsers.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No users online</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Collaboration Area */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Collaboration Space</CardTitle>
                <CardDescription>Chat, video call, and collaborate on documents</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={startVideoCall} disabled={isInCall}>
                  <Video className="h-4 w-4 mr-2" />
                  {isInCall ? "In Call" : "Start Video"}
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Screen
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat" className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Live Chat</span>
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center space-x-2">
                  <Video className="h-4 w-4" />
                  <span>Video Call</span>
                </TabsTrigger>
                <TabsTrigger value="docs" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Documents</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-4">
                <LiveChat roomId={selectedRoom} />
              </TabsContent>

              <TabsContent value="video" className="mt-4">
                <VideoCall 
                  isInCall={isInCall} 
                  onEndCall={endVideoCall}
                  roomId={selectedRoom}
                />
              </TabsContent>

              <TabsContent value="docs" className="mt-4">
                <CollaborativeEditor roomId={selectedRoom} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 