"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { StartupFeed } from "@/components/startup-feed"
import { GrantsFeed } from "@/components/grants-feed"
import { BlogFeed } from "@/components/blog-feed"
import { PitchPolisher } from "@/components/pitch-polisher"
import { CollaborationHub } from "@/components/collaboration-hub"
import { ProfileModal } from "@/components/profile-modal"
import { TokenModal } from "@/components/token-modal"
import { useAuth } from "@/contexts/auth-context"
import { Coins, User } from "lucide-react"

export function Dashboard() {
  const { user, userProfile } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ethiopian Startup Hub</h1>
              <p className="text-gray-600 text-sm">Connect, collaborate, and grow together</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Token Balance */}
              <TokenModal>
                <Button variant="outline" className="flex items-center space-x-2 hover:bg-yellow-50 hover:border-yellow-200">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{userProfile?.token_balance || 0}</span>
                  <span className="text-sm text-gray-600">tokens</span>
                </Button>
              </TokenModal>

              {/* Profile */}
              <ProfileModal>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                      {userProfile?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium">{userProfile?.name || "User"}</div>
                    <div className="text-xs text-gray-600">{user?.email}</div>
                  </div>
                </Button>
              </ProfileModal>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="startups" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white p-1 rounded-xl shadow-sm">
            <TabsTrigger value="startups" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
              Startups
            </TabsTrigger>
            <TabsTrigger value="grants" className="rounded-lg data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:shadow-sm">
              Grants
            </TabsTrigger>
            <TabsTrigger value="blog" className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
              Blog
            </TabsTrigger>
            <TabsTrigger value="pitch" className="rounded-lg data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-sm">
              Pitch AI
            </TabsTrigger>
            <TabsTrigger value="collaborate" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">
              Collaborate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="startups" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm p-6 border-0">
              <StartupFeed />
            </div>
          </TabsContent>

          <TabsContent value="grants" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm p-6 border-0">
              <GrantsFeed />
            </div>
          </TabsContent>

          <TabsContent value="blog" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm p-6 border-0">
              <BlogFeed />
            </div>
          </TabsContent>

          <TabsContent value="pitch" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm p-6 border-0">
              <PitchPolisher />
            </div>
          </TabsContent>

          <TabsContent value="collaborate" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm p-6 border-0">
              <CollaborationHub />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
