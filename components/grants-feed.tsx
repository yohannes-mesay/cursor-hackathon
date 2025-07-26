"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Coins, Search, Filter } from "lucide-react"
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
  payment_method: string | null
  phone_number: string | null
  account_name: string | null
  payment_status: string | null
  created_at: string
  users: {
    name: string
  }
}

export function GrantsFeed() {
  const [grants, setGrants] = useState<Grant[]>([])
  const [filteredGrants, setFilteredGrants] = useState<Grant[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [stakeAmounts, setStakeAmounts] = useState<{ [key: string]: number }>({})
  const [stakingId, setStakingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("stake_count")
  const { user, userProfile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchGrants()
  }, [])

  useEffect(() => {
    filterAndSortGrants()
  }, [grants, searchQuery, sortBy])

  const fetchGrants = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("grants")
      .select(`
        *,
        users (name)
      `)
      .order("stake_count", { ascending: false })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch grants",
        variant: "destructive",
      })
    } else {
      setGrants(data  [])
    }
    setLoading(false)
  }

  const filterAndSortGrants = () => {
    let filtered = grants

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (grant) =>
          grant.title.toLowerCase().includes(searchQuery.toLowerCase()) 
          grant.description.toLowerCase().includes(searchQuery.toLowerCase()) 
          grant.users.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "stake_count":
          return b.stake_count - a.stake_count
        case "amount_requested":
          return b.amount_requested - a.amount_requested
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

    setFilteredGrants(filtered)
  }

  const handleStake = async (grantId: string) => {
    if (!user) return

    const amount = stakeAmounts[grantId]  1

Hizikyas, [7/26/25 2:38 PM]
if (amount > (userProfile?.token_balance  0)) {
      toast({
        title: "Error",
        description: "Insufficient tokens",
        variant: "destructive",
      })
      return
    }

    setStakingId(grantId)

    const { data, error } = await supabase.rpc("stake_tokens", {
      p_grant_id: grantId,
      p_user_id: user.id,
      p_amount: amount,
    })

    if (error  !data.success) {
      toast({
        title: "Error",
        description: data?.error  "Failed to stake tokens",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `Staked ${amount} tokens successfully!`,
      })
      // Refresh both grants and user profile to update token balance
      await Promise.all([
        fetchGrants(),
        refreshProfile()
      ])
      // Reset the stake amount
      setStakeAmounts((prev) => ({ ...prev, [grantId]: 1 }))
    }
    setStakingId(null)
  }

  const updateStakeAmount = (grantId: string, amount: number) => {
    setStakeAmounts((prev) => ({ ...prev, [grantId]: amount }))
  }

  const GrantSkeleton = () => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-16 w-full mb-4" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-4 w-32" />
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
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <GrantSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Micro-Grant Requests</h2>
          {userProfile && (
            <p className="text-gray-600 mt-1">
              Your balance: <span className="font-semibold text-yellow-600">{userProfile.token_balance} tokens</span>
            </p>
          )}
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Grant
        </Button>
      </div>

      {/* Search and Filter Controls */}
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
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stake_count">Most Staked</SelectItem>
            <SelectItem value="amount_requested">Highest Amount</SelectItem>
            <SelectItem value="created_at">Most Recent</

Hizikyas, [7/26/25 2:38 PM]
SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredGrants.length} of {grants.length} grants
        {searchQuery && ` for "${searchQuery}"`}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredGrants.map((grant) => (
          <Card key={grant.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{grant.title}</CardTitle>
                  <CardDescription>by {grant.users.name}</CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant="outline" className="text-green-600">
                    ${grant.amount_requested.toLocaleString()}
                  </Badge>
                  {grant.payment_method && (
                    <Badge variant="secondary" className="text-xs">
                      {getPaymentMethodLabel(grant.payment_method)}
                    </Badge>
                  )}
                  {grant.payment_status && (
                    <Badge className={`text-xs ${getPaymentStatusColor(grant.payment_status)}`}>
                      {getPaymentStatusLabel(grant.payment_status)}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{grant.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Staked:</span>
                  <div className="flex items-center space-x-1">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{grant.stake_count}</span>
                  </div>
                </div>

                {grant.payment_method && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Smartphone className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-900">Payment Method</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      {getPaymentMethodLabel(grant.payment_method)} • {grant.phone_number}
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="1"
                    max={userProfile?.token_balance  0}
                    value={stakeAmounts[grant.id]  1}
                    onChange={(e) => updateStakeAmount(grant.id, Number.parseInt(e.target.value)  1)}
                    className="w-20"
                    disabled={stakingId === grant.id}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleStake(grant.id)}
                    disabled={
                      !userProfile?.token_balance  
                      userProfile.token_balance < (stakeAmounts[grant.id]  1) 
                      stakingId === grant.id
                    }
                  >
                    {stakingId === grant.id ? (
                      <>
                        <Coins className="h-4 w-4 mr-1 animate-pulse" />
                        Staking...
                      </>
                    ) : (
                      "Stake Tokens"
                    )}
                  </Button>
                </div>

Hizikyas, [7/26/25 2:38 PM]
{userProfile && userProfile.token_balance < (stakeAmounts[grant.id]  1) && (
                  <p className="text-xs text-red-500">
                    Insufficient tokens. You have {userProfile.token_balance} tokens available.
                  </p>
                )}

                <span className="text-xs text-gray-500">Posted {new Date(grant.created_at).toLocaleDateString()}</span>
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
