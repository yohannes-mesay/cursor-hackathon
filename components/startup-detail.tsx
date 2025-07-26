"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Calendar, 
  Users, 
  Target, 
  Lightbulb,
  TrendingUp,
  Mail,
  MessageCircle,
  ExternalLink,
  Gift
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { GrantOfferModal } from "@/components/grant-offer-modal"

interface StartupDetailProps {
  startupId: string
}

interface DetailedStartup {
  id: string
  name: string
  tagline: string
  stage: string
  support_count: number
  created_at: string
  user_id: string
  users: {
    id: string
    name: string
    email: string
    areas_of_help: string[]
    token_balance: number
  }
}

interface Post {
  id: string
  title: string
  body: string
  created_at: string
  tags: string[]
}

interface Grant {
  id: string
  title: string
  description: string
  amount_requested: number
  stake_count: number
  created_at: string
}

export function StartupDetail({ startupId }: StartupDetailProps) {
  const [startup, setStartup] = useState<DetailedStartup | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [grants, setGrants] = useState<Grant[]>([])
  const [loading, setLoading] = useState(true)
  const [supportingId, setSupportingId] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchStartupDetails()
  }, [startupId])

  const fetchStartupDetails = async () => {
    setLoading(true)
    
    try {
      // Fetch startup details
      const { data: startupData, error: startupError } = await supabase
        .from("startups")
        .select(`
          *,
          users (
            id,
            name,
            email,
            areas_of_help,
            token_balance
          )
        `)
        .eq("id", startupId)
        .single()

      if (startupError) {
        toast({
          title: "Error",
          description: "Failed to fetch startup details",
          variant: "destructive",
        })
        return
      }

      setStartup(startupData)

      // Fetch founder's posts
      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", startupData.user_id)
        .order("created_at", { ascending: false })
        .limit(5)

      setPosts(postsData || [])

      // Fetch founder's grants
      const { data: grantsData } = await supabase
        .from("grants")
        .select("*")
        .eq("user_id", startupData.user_id)
        .order("created_at", { ascending: false })
        .limit(5)

      setGrants(grantsData || [])

    } catch (error) {
      console.error("Error fetching startup details:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSupport = async () => {
    if (!startup) return
    
    setSupportingId(startup.id)
    const { error } = await supabase.rpc("increment_support_count", {
      startup_id: startup.id,
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
      // Update local state
      setStartup(prev => prev ? { ...prev, support_count: prev.support_count + 1 } : null)
    }
    setSupportingId(null)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: startup?.name,
          text: startup?.tagline,
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
        description: "Startup link copied to clipboard",
      })
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "idea":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "mvp":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "growth":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "scaling":
        return "bg-purple-50 text-purple-700 border-purple-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case "idea":
        return <Lightbulb className="h-4 w-4" />
      case "mvp":
        return <Target className="h-4 w-4" />
      case "growth":
        return <TrendingUp className="h-4 w-4" />
      case "scaling":
        return <Users className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div className="h-10 bg-gray-200 rounded-lg w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-1/2"></div>
              <div className="flex gap-4">
                <div className="h-12 bg-gray-200 rounded-lg w-28"></div>
                <div className="h-12 bg-gray-200 rounded-lg w-28"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!startup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 mx-4 max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Startup Not Found</h2>
          <p className="text-gray-600 mb-6">The startup you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

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
            Back to Startups
          </Button>
          
          {/* Mobile Header */}
          <div className="block lg:hidden">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-16 w-16 ring-4 ring-blue-50">
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {startup.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 truncate">{startup.name}</h1>
                <p className="text-gray-600 text-sm line-clamp-2">{startup.tagline}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <Badge className={`border ${getStageColor(startup.stage)} px-3 py-1`}>
                {getStageIcon(startup.stage)}
                <span className="ml-2 capitalize font-medium">{startup.stage}</span>
              </Badge>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSupport}
                  disabled={supportingId === startup.id}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Heart className={`h-4 w-4 mr-2 ${supportingId === startup.id ? 'animate-pulse' : ''}`} />
                  {startup.support_count}
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                <Avatar className="h-20 w-20 ring-4 ring-blue-50">
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {startup.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">{startup.name}</h1>
                  <p className="text-xl text-gray-600 mb-4 max-w-2xl">{startup.tagline}</p>
                  
                  <div className="flex items-center space-x-6 mb-4">
                    <Badge className={`border ${getStageColor(startup.stage)} px-4 py-2 text-sm`}>
                      {getStageIcon(startup.stage)}
                      <span className="ml-2 capitalize font-medium">{startup.stage}</span>
                    </Badge>
                    
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        Founded {new Date(startup.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="hover:bg-gray-50"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>

                {/* Grant Offer Button - Only show if user is not the founder */}
                {user && user.id !== startup.user_id && (
                  <GrantOfferModal
                    startupId={startup.id}
                    startupName={startup.name}
                    founderName={startup.users.name}
                  >
                    <Button
                      variant="outline"
                      className="hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Offer Grant
                    </Button>
                  </GrantOfferModal>
                )}
                
                <Button
                  onClick={handleSupport}
                  disabled={supportingId === startup.id}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Heart className={`h-4 w-4 mr-2 ${supportingId === startup.id ? 'animate-pulse' : ''}`} />
                  Support ({startup.support_count})
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="about" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">About</TabsTrigger>
                <TabsTrigger value="posts" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Posts ({posts.length})</TabsTrigger>
                <TabsTrigger value="grants" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Grants ({grants.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-0">
                <div className="space-y-6">
                  <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900">About {startup.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-3 text-gray-900">Mission</h3>
                        <p className="text-gray-700 leading-relaxed">{startup.tagline}</p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-semibold mb-3 text-gray-900">Current Stage</h3>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-2 rounded-lg ${getStageColor(startup.stage)}`}>
                            {getStageIcon(startup.stage)}
                          </div>
                          <span className="capitalize font-medium text-gray-900">{startup.stage} stage</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {startup.stage === 'idea' && 'Early concept development and validation phase'}
                          {startup.stage === 'mvp' && 'Building and testing minimum viable product'}
                          {startup.stage === 'growth' && 'Scaling user base and revenue streams'}
                          {startup.stage === 'scaling' && 'Expanding market reach and operations'}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-semibold mb-3 text-gray-900">Community Support</h3>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-lg">
                            <Heart className="h-5 w-5 text-red-500" />
                            <span className="font-medium text-gray-900">{startup.support_count} supporters</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="posts" className="mt-0">
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                      <CardContent className="py-12 text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 text-lg">No posts yet</p>
                        <p className="text-gray-400 text-sm mt-2">Check back later for updates from the team</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {posts.map((post) => (
                        <Card key={post.id} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg text-gray-900">{post.title}</CardTitle>
                            <CardDescription className="text-gray-600">
                              {new Date(post.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">{post.body}</p>
                            <div className="flex flex-wrap gap-2">
                              {post.tags?.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="grants" className="mt-0">
                <div className="space-y-4">
                  {grants.length === 0 ? (
                    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                      <CardContent className="py-12 text-center">
                        <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 text-lg">No grant requests yet</p>
                        <p className="text-gray-400 text-sm mt-2">Funding requests will appear here</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {grants.map((grant) => (
                        <Card key={grant.id} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <CardTitle className="text-lg text-gray-900">{grant.title}</CardTitle>
                              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 w-fit">
                                ${grant.amount_requested.toLocaleString()}
                              </Badge>
                            </div>
                            <CardDescription className="text-gray-600">
                              {new Date(grant.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-700 mb-4 leading-relaxed">{grant.description}</p>
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-2" />
                              <span>{grant.stake_count} backers</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Grant Offer CTA - Mobile */}
            {user && user.id !== startup.user_id && (
              <div className="xl:hidden">
                <GrantOfferModal
                  startupId={startup.id}
                  startupName={startup.name}
                  founderName={startup.users.name}
                >
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                    <Gift className="h-4 w-4 mr-2" />
                    Offer Grant to {startup.name}
                  </Button>
                </GrantOfferModal>
              </div>
            )}

            {/* Founder Info */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Founder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 mb-4 ring-4 ring-gray-50">
                    <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-lg">
                      {startup.users.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">{startup.users.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">Founder & CEO</p>
                  
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
            
            {/* Help Needed */}
            {startup.users.areas_of_help && startup.users.areas_of_help.length > 0 && (
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Help Needed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {startup.users.areas_of_help.map((area) => (
                      <Badge key={area} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Quick Stats */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Stage</span>
                  <Badge className={`${getStageColor(startup.stage)} border`}>
                    <span className="capitalize font-medium">{startup.stage}</span>
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Supporters</span>
                  <span className="font-semibold text-gray-900">{startup.support_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Posts</span>
                  <span className="font-semibold text-gray-900">{posts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Grant Requests</span>
                  <span className="font-semibold text-gray-900">{grants.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 