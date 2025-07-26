"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Plus, Coins, DollarSign, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { CreateGrantDialog } from "@/components/create-grant-dialog"
import { GrantPaymentModal } from "@/components/grant-payment-modal"

interface Grant {
  id: string
  title: string
  description: string
  amount_requested: number
  stake_count: number
  total_funded?: number
  funding_percentage?: number
  created_at: string
  users: {
    name: string
  }
}

export function GrantsFeed() {
  const [grants, setGrants] = useState<Grant[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null)
  const [stakeAmounts, setStakeAmounts] = useState<{ [key: string]: number }>({})
  const { user, userProfile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchGrants()
  }, [])

  const fetchGrants = async () => {
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
      setGrants(data || [])
    }
    setLoading(false)
  }

  const handleStake = async (grantId: string) => {
    if (!user) return

    const amount = stakeAmounts[grantId] || 1

    if (amount > (userProfile?.token_balance || 0)) {
      toast({
        title: "Error",
        description: "Insufficient tokens",
        variant: "destructive",
      })
      return
    }

    const { data, error } = await supabase.rpc("stake_tokens", {
      p_grant_id: grantId,
      p_user_id: user.id,
      p_amount: amount,
    })

    if (error || !data.success) {
      toast({
        title: "Error",
        description: data?.error || "Failed to stake tokens",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `Staked ${amount} tokens successfully!`,
      })
      fetchGrants()
      // Reset the stake amount
      setStakeAmounts((prev) => ({ ...prev, [grantId]: 1 }))
    }
  }

  const updateStakeAmount = (grantId: string, amount: number) => {
    setStakeAmounts((prev) => ({ ...prev, [grantId]: amount }))
  }

  const handleGrantClick = (grant: Grant) => {
    setSelectedGrant(grant)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    fetchGrants() // Refresh grants to show updated funding
    toast({
      title: "Payment Initiated",
      description: "Thank you for supporting this grant!",
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading grants...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Micro-Grant Requests</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Grant
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {grants.map((grant) => {
          const fundingPercentage = grant.funding_percentage || 0
          const totalFunded = grant.total_funded || 0
          const remainingAmount = grant.amount_requested - totalFunded
          const isFullyFunded = fundingPercentage >= 100

          return (
            <Card 
              key={grant.id} 
              className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500"
              onClick={() => handleGrantClick(grant)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{grant.title}</CardTitle>
                    <CardDescription>by {grant.users.name}</CardDescription>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="outline" className="text-green-600">
                      {grant.amount_requested.toLocaleString()} ETB
                    </Badge>
                    {totalFunded > 0 && (
                      <div className="text-xs text-green-600 font-medium">
                        {totalFunded.toLocaleString()} ETB funded
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{grant.description}</p>

                {/* Funding Progress */}
                {totalFunded > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Funding Progress</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {fundingPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={fundingPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{totalFunded.toLocaleString()} ETB raised</span>
                      <span>{remainingAmount.toLocaleString()} ETB remaining</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Community Staking Section */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Community Stakes:</span>
                    <div className="flex items-center space-x-1">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold">{grant.stake_count}</span>
                    </div>
                  </div>

                  {/* Staking Interface */}
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Input
                      type="number"
                      min="1"
                      max={userProfile?.token_balance || 0}
                      value={stakeAmounts[grant.id] || 1}
                      onChange={(e) => updateStakeAmount(grant.id, Number.parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleStake(grant.id)}
                      disabled={!userProfile?.token_balance || userProfile.token_balance < (stakeAmounts[grant.id] || 1)}
                    >
                      Stake Tokens
                    </Button>
                  </div>

                  {/* Payment CTA */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-xs text-gray-500">
                      Posted {new Date(grant.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGrantClick(grant)
                      }}
                    >
                      <DollarSign className="h-3 w-3" />
                      {isFullyFunded ? 'View Details' : 'Fund Grant'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {grants.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No grant requests yet. Be the first to request funding!</p>
        </div>
      )}

      <CreateGrantDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
        onSuccess={fetchGrants} 
      />
      
      <GrantPaymentModal
        grant={selectedGrant}
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
