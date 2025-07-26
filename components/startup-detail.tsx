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
  ExternalLink
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

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
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "mvp":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "growth":
        return "bg-green-100 text-green-800 border-green-300"
      case "scaling":
        return "bg-purple-100 text-purple-800 border-purple-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-32 mb-6"></div>
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mb-6"></div>
              <div className="flex gap-4">
                <div className="h-10 bg-gray-300 rounded w-24"></div>
                <div className="h-10 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!startup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Startup Not Found</h2>
          <p className="text-gray-600 mb-4">The startup you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Startups
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-bold bg-blue-500 text-white">
                  {startup.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{startup.name}</h1>
                <p className="text-lg text-gray-600 mb-3">{startup.tagline}</p>
                
                <div className="flex items-center space-x-4 mb-4">
                  <Badge className={`border ${getStageColor(startup.stage)} px-3 py-1`}>
                    {getStageIcon(startup.stage)}
                    <span className="ml-2 capitalize">{startup.stage}</span>
                  </Badge>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      Founded {new Date(startup.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              <Button
                onClick={handleSupport}
                disabled={supportingId === startup.id}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Heart className={`h-4 w-4 mr-2 ${supportingId === startup.id ? 'animate-pulse' : ''}`} />
                Support ({startup.support_count})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
                <TabsTrigger value="grants">Grants ({grants.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {startup.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Mission</h3>
                      <p className="text-gray-700">{startup.tagline}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold mb-2">Current Stage</h3>
                      <div className="flex items-center space-x-2">
                        {getStageIcon(startup.stage)}
                        <span className="capitalize">{startup.stage} stage</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {startup.stage === 'idea' && 'Early concept development and validation'}
                        {startup.stage === 'mvp' && 'Building and testing minimum viable product'}
                        {startup.stage === 'growth' && 'Scaling user base and revenue'}
                        {startup.stage === 'scaling' && 'Expanding market reach and operations'}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold mb-2">Community Support</h3>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>{startup.support_count} supporters</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="posts" className="mt-6">
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-gray-500">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No posts yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    posts.map((post) => (
                      <Card key={post.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{post.title}</CardTitle>
                          <CardDescription>
                            {new Date(post.created_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 mb-3 line-clamp-3">{post.body}</p>
                          <div className="flex flex-wrap gap-2">
                            {post.tags?.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="grants" className="mt-6">
                <div className="space-y-4">
                  {grants.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-gray-500">
                        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No grant requests yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    grants.map((grant) => (
                      <Card key={grant.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{grant.title}</CardTitle>
                            <Badge variant="outline" className="text-green-600">
                              ${grant.amount_requested.toLocaleString()}
                            </Badge>
                          </div>
                          <CardDescription>
                            {new Date(grant.created_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 mb-3">{grant.description}</p>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{grant.stake_count} backers</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Founder Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Founder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gray-500 text-white">
                      {startup.users.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{startup.users.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">Founder & CEO</p>
                    
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Help Needed */}
            {startup.users.areas_of_help && startup.users.areas_of_help.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Help Needed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {startup.users.areas_of_help.map((area) => (
                      <Badge key={area} variant="outline" className="mr-2 mb-2">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Stage</span>
                  <span className="capitalize font-medium">{startup.stage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Supporters</span>
                  <span className="font-medium">{startup.support_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts</span>
                  <span className="font-medium">{posts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Grant Requests</span>
                  <span className="font-medium">{grants.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 