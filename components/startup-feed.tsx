"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, Plus, Search, Filter, ExternalLink } from "lucide-react"
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
  const [filteredStartups, setFilteredStartups] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [supportingId, setSupportingId] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [stageFilter, setStageFilter] = useState("all")
  const router = useRouter()
  const { userProfile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchStartups()
  }, [])

  useEffect(() => {
    filterStartups()
  }, [startups, searchQuery, stageFilter])

  const fetchStartups = async () => {
    setLoading(true)
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

  const filterStartups = () => {
    let filtered = startups

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (startup) =>
          startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          startup.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          startup.users.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Stage filter
    if (stageFilter !== "all") {
      filtered = filtered.filter((startup) => startup.stage === stageFilter)
    }

    setFilteredStartups(filtered)
  }

  const handleSupport = async (e: React.MouseEvent, startupId: string) => {
    e.stopPropagation() // Prevent card click when supporting
    setSupportingId(startupId)
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
    setSupportingId(null)
  }

  const handleCardClick = (startupId: string) => {
    router.push(`/startup/${startupId}`)
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

  const StartupSkeleton = () => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StartupSkeleton key={i} />
          ))}
        </div>
      </div>
    )
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

      {/* Search and Filter Controls */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search startups, taglines, or founders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="idea">Idea</SelectItem>
            <SelectItem value="mvp">MVP</SelectItem>
            <SelectItem value="growth">Growth</SelectItem>
            <SelectItem value="scaling">Scaling</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredStartups.length} of {startups.length} startups
        {searchQuery && ` for "${searchQuery}"`}
        {stageFilter !== "all" && ` in ${stageFilter} stage`}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredStartups.map((startup) => (
          <Card 
            key={startup.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => handleCardClick(startup.id)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors flex items-center">
                    {startup.name}
                    <ExternalLink className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription>by {startup.users.name}</CardDescription>
                </div>
                <Badge className={getStageColor(startup.stage)}>{startup.stage}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{startup.tagline}</p>
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleSupport(e, startup.id)}
                  disabled={supportingId === startup.id}
                  className="flex items-center space-x-1 hover:bg-red-50 hover:border-red-200"
                >
                  <Heart className={`h-4 w-4 ${supportingId === startup.id ? 'animate-pulse' : ''}`} />
                  <span>{startup.support_count}</span>
                  {supportingId === startup.id && <span className="ml-1">...</span>}
                </Button>
                <span className="text-xs text-gray-500">{new Date(startup.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStartups.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No startups found</div>
          <div className="text-sm text-gray-400">
            {searchQuery || stageFilter !== "all" 
              ? "Try adjusting your search or filters" 
              : "Be the first to add a startup!"}
          </div>
        </div>
      )}

      <CreateStartupDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={fetchStartups} />
    </div>
  )
}
