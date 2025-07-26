"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut, User, Coins } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { StartupFeed } from "@/components/startup-feed"
import { BlogFeed } from "@/components/blog-feed"
import { GrantsFeed } from "@/components/grants-feed"
import { PitchPolisher } from "@/components/pitch-polisher"
import { CollaborationHub } from "@/components/collaboration-hub"

export function Dashboard() {
  const { user, userProfile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState("startups")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Inkubeta</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-semibold text-yellow-700">{userProfile?.token_balance || 0} tokens</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{userProfile?.name}</span>
              </div>

              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="startups">Startups</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="grants">Grants</TabsTrigger>
            <TabsTrigger value="pitch">Pitch Polisher</TabsTrigger>
            <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
          </TabsList>

          <TabsContent value="startups" className="mt-6">
            <StartupFeed />
          </TabsContent>

          <TabsContent value="blog" className="mt-6">
            <BlogFeed />
          </TabsContent>

          <TabsContent value="grants" className="mt-6">
            <GrantsFeed />
          </TabsContent>

          <TabsContent value="pitch" className="mt-6">
            <PitchPolisher />
          </TabsContent>

          <TabsContent value="collaborate" className="mt-6">
            <CollaborationHub />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
