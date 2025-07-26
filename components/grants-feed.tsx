"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Coins } from "lucide-react"
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
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
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
        {grants.map((grant) => (
          <Card key={grant.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{grant.title}</CardTitle>
                  <CardDescription>by {grant.users.name}</CardDescription>
                </div>
                <Badge variant="outline" className="text-green-600">
                  ${grant.amount_requested.toLocaleString()}
                </Badge>
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

                <div className="flex items-center space-x-2">
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

                <span className="text-xs text-gray-500">Posted {new Date(grant.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateGrantDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={fetchGrants} />
    </div>
  )
}
