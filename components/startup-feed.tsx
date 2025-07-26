"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { CreateStartupDialog } from "@/components/create-startup-dialog"

interface Startup {
  id: string
  name: string
  tagline: string
  stage: string
  support_count: number
  created_at: string
  users: {
    name: string
  }
}

export function StartupFeed() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { userProfile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchStartups()
  }, [])

  const fetchStartups = async () => {
    const { data, error } = await supabase
      .from("startups")
      .select(`
        *,
        users (name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch startups",
        variant: "destructive",
      })
    } else {
      setStartups(data || [])
    }
    setLoading(false)
  }

  const handleSupport = async (startupId: string) => {
    const { error } = await supabase.rpc("increment_support_count", {
      startup_id: startupId,
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to support startup",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Startup supported!",
      })
      fetchStartups() // Refresh the list
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "idea":
        return "bg-yellow-100 text-yellow-800"
      case "mvp":
        return "bg-blue-100 text-blue-800"
      case "growth":
        return "bg-green-100 text-green-800"
      case "scaling":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading startups...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ethiopian Startups</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Startup
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {startups.map((startup) => (
          <Card key={startup.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{startup.name}</CardTitle>
                  <CardDescription>by {startup.users.name}</CardDescription>
                </div>
                <Badge className={getStageColor(startup.stage)}>{startup.stage}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{startup.tagline}</p>
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSupport(startup.id)}
                  className="flex items-center space-x-1"
                >
                  <Heart className="h-4 w-4" />
                  <span>{startup.support_count}</span>
                </Button>
                <span className="text-xs text-gray-500">{new Date(startup.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateStartupDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={fetchStartups} />
    </div>
  )
}
