"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, TrendingUp, Search, SortAsc, ExternalLink, DollarSign, Users, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { CreateGrantDialog } from "@/components/create-grant-dialog"

interface Grant {
  id: string
  title: string
  description: string
  amount_requested: number
  stake_count: number
  created_at: string
  users: {
    name: string
  }
}

export function GrantsFeed() {
  const [grants, setGrants] = useState<Grant[]>([])
  const [filteredGrants, setFilteredGrants] = useState<Grant[]>([])
  const [loading, setLoading] = useState(true)
  const [stakingId, setStakingId] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const router = useRouter()
  const { userProfile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchGrants()
  }, [])

  useEffect(() => {
    filterGrants()
  }, [grants, searchQuery, sortBy])

  const fetchGrants = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("grants")
      .select(`
        *,
        users (name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch grants",
        variant: "destructive",
      })
    } else {
      setGrants(data || [])
    }
    setLoading(false)
  }

  const filterGrants = () => {
    let filtered = grants

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (grant) =>
          grant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          grant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          grant.users.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case "amount_high":
        filtered.sort((a, b) => b.amount_requested - a.amount_requested)
        break
      case "amount_low":
        filtered.sort((a, b) => a.amount_requested - b.amount_requested)
        break
      case "popular":
        filtered.sort((a, b) => b.stake_count - a.stake_count)
        break
    }

    setFilteredGrants(filtered)
  }

  const handleStake = async (e: React.MouseEvent, grantId: string) => {
    e.stopPropagation() // Prevent card click when staking
    setStakingId(grantId)
    const { error } = await supabase.rpc("increment_stake_count", {
      grant_id: grantId,
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to stake in grant",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Grant staked successfully!",
      })
      fetchGrants() // Refresh the list
    }
    setStakingId(null)
  }

  const handleCardClick = (grantId: string) => {
    router.push(`/grant/${grantId}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const GrantSkeleton = () => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-20" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
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
            <GrantSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Micro-Grants</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Grant
        </Button>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search grants, descriptions, or creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SortAsc className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="amount_high">Highest Amount</SelectItem>
            <SelectItem value="amount_low">Lowest Amount</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredGrants.length} of {grants.length} grants
        {searchQuery && ` for "${searchQuery}"`}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredGrants.map((grant) => (
          <Card 
            key={grant.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => handleCardClick(grant.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg group-hover:text-green-600 transition-colors flex items-start justify-between line-clamp-2">
                  <span className="flex-1 mr-2">{grant.title}</span>
                  <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                </CardTitle>
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 ml-2 flex-shrink-0">
                  ${grant.amount_requested.toLocaleString()}
                </Badge>
              </div>
              <CardDescription className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(grant.created_at)}
                </div>
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {grant.stake_count} backers
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {grant.description}
              </p>
              
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleStake(e, grant.id)}
                  disabled={stakingId === grant.id}
                  className="flex items-center space-x-1 hover:bg-green-50 hover:border-green-200"
                >
                  <TrendingUp className={`h-4 w-4 ${stakingId === grant.id ? 'animate-pulse' : ''}`} />
                  <span>Stake</span>
                  {stakingId === grant.id && <span className="ml-1">...</span>}
                </Button>
                
                <div className="text-sm text-gray-600">
                  by {grant.users.name}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGrants.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No grants found</div>
          <div className="text-sm text-gray-400">
            {searchQuery 
              ? "Try adjusting your search terms" 
              : "Be the first to request a grant!"}
          </div>
        </div>
      )}

      <CreateGrantDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={fetchGrants} />
    </div>
  )
}
