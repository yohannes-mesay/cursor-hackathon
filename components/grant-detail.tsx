"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Share2, 
  Calendar, 
  User, 
  DollarSign,
  Users,
  Target,
  TrendingUp,
  MessageCircle,
  Mail,
  CheckCircle,
  Timer,
  Coins
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface GrantDetailProps {
  grantId: string
}

interface DetailedGrant {
  id: string
  title: string
  description: string
  amount_requested: number
  stake_count: number
  created_at: string
  user_id: string
  users: {
    id: string
    name: string
    email: string
    startup_name?: string
    tagline?: string
    areas_of_help: string[]
  }
}

interface RelatedGrant {
  id: string
  title: string
  description: string
  amount_requested: number
  stake_count: number
  created_at: string
}

export function GrantDetail({ grantId }: GrantDetailProps) {
  const [grant, setGrant] = useState<DetailedGrant | null>(null)
  const [relatedGrants, setRelatedGrants] = useState<RelatedGrant[]>([])
  const [loading, setLoading] = useState(true)
  const [hasStaked, setHasStaked] = useState(false)
  const [stakeAmount, setStakeAmount] = useState(100)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchGrantDetails()
  }, [grantId])

  const fetchGrantDetails = async () => {
    setLoading(true)
    
    try {
      // Fetch grant details
      const { data: grantData, error: grantError } = await supabase
        .from("grants")
        .select(`
          *,
          users (
            id,
            name,
            email,
            startup_name,
            tagline,
            areas_of_help
          )
        `)
        .eq("id", grantId)
        .single()

      if (grantError) {
        toast({
          title: "Error",
          description: "Failed to fetch grant details",
          variant: "destructive",
        })
        return
      }

      setGrant(grantData)

      // Fetch related grants (same author or similar amount range)
      if (grantData) {
        const { data: relatedData } = await supabase
          .from("grants")
          .select("id, title, description, amount_requested, stake_count, created_at")
          .neq("id", grantId)
          .or(
            `user_id.eq.${grantData.user_id},amount_requested.gte.${Math.floor(grantData.amount_requested * 0.5)}.and.amount_requested.lte.${Math.ceil(grantData.amount_requested * 1.5)}`
          )
          .order("created_at", { ascending: false })
          .limit(3)

        setRelatedGrants(relatedData || [])
      }

    } catch (error) {
      console.error("Error fetching grant details:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStake = async () => {
    if (!grant) return
    
    const { error } = await supabase.rpc("increment_stake_count", {
      grant_id: grant.id,
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to stake in grant",
        variant: "destructive",
      })
    } else {
      setHasStaked(true)
      setGrant(prev => prev ? { ...prev, stake_count: prev.stake_count + 1 } : null)
      toast({
        title: "Success",
        description: `You've staked $${stakeAmount} in this grant!`,
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: grant?.title,
          text: grant?.description.substring(0, 100) + "...",
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link Copied",
        description: "Grant link copied to clipboard",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getProgressPercentage = () => {
    if (!grant) return 0
    // Mock calculation - could be based on actual funding received
    const funded = grant.stake_count * 50 // Assume each stake is $50
    const percentage = Math.min((funded / grant.amount_requested) * 100, 100)
    return Math.round(percentage)
  }

  const handleRelatedGrantClick = (relatedGrantId: string) => {
    router.push(`/grant/${relatedGrantId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
            <div className="bg-white rounded-xl shadow-sm p-8 space-y-4">
              <div className="h-10 bg-gray-200 rounded-lg w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-1/2"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!grant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 mx-4 max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coins className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Grant Not Found</h2>
          <p className="text-gray-600 mb-6">The grant you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const progressPercentage = getProgressPercentage()
  const amountFunded = Math.round((progressPercentage / 100) * grant.amount_requested)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Grants
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border-0">
              {/* Grant Header */}
              <div className="p-6 sm:p-8 border-b border-gray-100">
                {/* Mobile Header */}
                <div className="block sm:hidden mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {grant.title}
                  </h1>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-10 w-10 ring-2 ring-green-50">
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm">
                        {grant.users.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{grant.users.name}</h3>
                      <div className="flex items-center text-xs text-gray-600 space-x-3">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(grant.created_at)}
                        </div>
                        {grant.users.startup_name && (
                          <div className="flex items-center truncate">
                            <Target className="h-3 w-3 mr-1" />
                            <span className="truncate">{grant.users.startup_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden sm:block">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 mr-8">
                      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                        {grant.title}
                      </h1>
                      
                      <div className="flex items-center space-x-6 mb-4">
                        <Avatar className="h-12 w-12 ring-2 ring-green-50">
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                            {grant.users.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900">{grant.users.name}</h3>
                          <div className="flex items-center text-sm text-gray-600 space-x-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(grant.created_at)}
                            </div>
                            {grant.users.startup_name && (
                              <div className="flex items-center">
                                <Target className="h-4 w-4 mr-1" />
                                {grant.users.startup_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="hover:bg-gray-50 flex-shrink-0"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
                
                {/* Funding Progress */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-600">Funding Progress</span>
                    <span className="text-sm font-bold text-green-600">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3 mb-3 bg-gray-100" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="font-medium">${amountFunded.toLocaleString()} raised</span>
                    <span className="font-medium">${grant.amount_requested.toLocaleString()} goal</span>
                  </div>
                </div>
                
                {/* Key Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                      ${grant.amount_requested.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Requested</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                      {grant.stake_count}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Backers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
                      {Math.ceil((Date.now() - new Date(grant.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Days Active</div>
                  </div>
                </div>
              </div>
              
              {/* Grant Description */}
              <div className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">About This Grant</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base sm:text-lg">
                    {grant.description}
                  </p>
                </div>
              </div>
              
              {/* Impact & Goals */}
              <div className="p-6 sm:p-8 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-100">
                <h3 className="text-lg font-semibold mb-6 text-gray-900">Expected Impact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Market Research</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Comprehensive market analysis and validation</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Product Development</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Build and iterate on core features</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Team Growth</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Hire key team members and advisors</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Community Impact</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Create positive social and economic value</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Stake in Grant */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Support This Grant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Minimum Stake</div>
                    <div className="text-sm text-gray-600">$50</div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Stake Amount</label>
                  <select 
                    value={stakeAmount} 
                    onChange={(e) => setStakeAmount(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-3 text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value={50}>$50</option>
                    <option value={100}>$100</option>
                    <option value={250}>$250</option>
                    <option value={500}>$500</option>
                    <option value={1000}>$1,000</option>
                  </select>
                </div>
                
                <Button 
                  className="w-full py-3 text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" 
                  onClick={handleStake}
                  disabled={hasStaked}
                >
                  {hasStaked ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Staked!
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Stake ${stakeAmount}
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  Support innovative projects and earn potential returns
                </p>
              </CardContent>
            </Card>
            
            {/* Grant Creator */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Grant Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 mb-4 ring-4 ring-green-50">
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-lg">
                      {grant.users.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{grant.users.name}</h3>
                  {grant.users.startup_name && (
                    <p className="text-sm text-green-600 mb-1">
                      Founder of {grant.users.startup_name}
                    </p>
                  )}
                  {grant.users.tagline && (
                    <p className="text-sm text-gray-600 mb-4">{grant.users.tagline}</p>
                  )}
                  
                  <div className="w-full space-y-2">
                    <Button variant="outline" size="sm" className="w-full hover:bg-gray-50">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    <Button variant="outline" size="sm" className="w-full hover:bg-gray-50">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Related Grants */}
            {relatedGrants.length > 0 && (
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Related Grants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedGrants.map((relatedGrant) => (
                    <div 
                      key={relatedGrant.id}
                      className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors border border-gray-100"
                      onClick={() => handleRelatedGrantClick(relatedGrant.id)}
                    >
                      <h4 className="font-medium text-sm mb-2 line-clamp-2 hover:text-green-600 transition-colors">
                        {relatedGrant.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {relatedGrant.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-medium">${relatedGrant.amount_requested.toLocaleString()}</span>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {relatedGrant.stake_count} backers
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            
            {/* Grant Stats */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Grant Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Requested</span>
                  <span className="font-semibold text-gray-900">${grant.amount_requested.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Backers</span>
                  <span className="font-semibold text-gray-900">{grant.stake_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Funding Progress</span>
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    {progressPercentage}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Days Active</span>
                  <div className="flex items-center">
                    <Timer className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="font-semibold text-gray-900">
                      {Math.ceil((Date.now() - new Date(grant.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 
    </div>
  )
} 