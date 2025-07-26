"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Calendar, 
  User, 
  Tag,
  MessageCircle,
  Eye,
  Clock,
  BookOpen
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface BlogDetailProps {
  postId: string
}

interface DetailedPost {
  id: string
  title: string
  body: string
  tags: string[]
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

interface RelatedPost {
  id: string
  title: string
  body: string
  created_at: string
  tags: string[]
}

export function BlogDetail({ postId }: BlogDetailProps) {
  const [post, setPost] = useState<DetailedPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchPostDetails()
  }, [postId])

  const fetchPostDetails = async () => {
    setLoading(true)
    
    try {
      // Fetch post details
      const { data: postData, error: postError } = await supabase
        .from("posts")
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
        .eq("id", postId)
        .single()

      if (postError) {
        toast({
          title: "Error",
          description: "Failed to fetch blog post",
          variant: "destructive",
        })
        return
      }

      setPost(postData)

      // Fetch related posts (same author or similar tags)
      if (postData) {
        const { data: relatedData } = await supabase
          .from("posts")
          .select("id, title, body, created_at, tags")
          .neq("id", postId)
          .or(
            `user_id.eq.${postData.user_id},tags.cs.{${postData.tags?.join(',') || ''}}`
          )
          .order("created_at", { ascending: false })
          .limit(3)

        setRelatedPosts(relatedData || [])
      }

      // Set initial like count (mock data for now)
      setLikeCount(Math.floor(Math.random() * 50) + 5)

    } catch (error) {
      console.error("Error fetching post details:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!liked) {
      setLiked(true)
      setLikeCount(prev => prev + 1)
      toast({
        title: "Liked!",
        description: "You liked this post",
      })
    } else {
      setLiked(false)
      setLikeCount(prev => prev - 1)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.body.substring(0, 100) + "...",
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
        description: "Blog post link copied to clipboard",
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

  const getReadingTime = (text: string) => {
    const wordsPerMinute = 200
    const wordCount = text.split(' ').length
    const readingTime = Math.ceil(wordCount / wordsPerMinute)
    return readingTime
  }

  const handleRelatedPostClick = (relatedPostId: string) => {
    router.push(`/blog/${relatedPostId}`)
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

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 mx-4 max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
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
            Back to Blog
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            <article className="bg-white rounded-xl shadow-sm overflow-hidden border-0">
              {/* Article Header */}
              <div className="p-6 sm:p-8 border-b border-gray-100">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  {post.title}
                </h1>
                
                {/* Mobile Author Info */}
                <div className="block sm:hidden mb-6">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 ring-2 ring-blue-50">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                        {post.users.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{post.users.name}</h3>
                      <div className="flex items-center text-xs text-gray-600 space-x-3">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(post.created_at)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {getReadingTime(post.body)} min
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Author Info */}
                <div className="hidden sm:flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 ring-2 ring-blue-50">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {post.users.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.users.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(post.created_at)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {getReadingTime(post.body)} min read
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="hover:bg-gray-50"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    
                    <Button
                      variant={liked ? "default" : "outline"}
                      size="sm"
                      onClick={handleLike}
                      className={liked ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white" : "hover:bg-red-50 hover:border-red-200 hover:text-red-600"}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                      {likeCount}
                    </Button>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex sm:hidden space-x-2 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex-1 hover:bg-gray-50"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  
                  <Button
                    variant={liked ? "default" : "outline"}
                    size="sm"
                    onClick={handleLike}
                    className={`flex-1 ${liked ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white" : "hover:bg-red-50 hover:border-red-200 hover:text-red-600"}`}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-current' : ''}`} />
                    {likeCount}
                  </Button>
                </div>
                
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Article Body */}
              <div className="p-6 sm:p-8">
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base sm:text-lg">
                    {post.body}
                  </div>
                </div>
              </div>
              
              {/* Article Footer */}
              <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {Math.floor(Math.random() * 500) + 100} views
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {Math.floor(Math.random() * 20) + 1} comments
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="w-fit">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </article>
          </div>
          
          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Author Info */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">About the Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 mb-4 ring-4 ring-blue-50">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                      {post.users.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{post.users.name}</h3>
                  {post.users.startup_name && (
                    <p className="text-sm text-blue-600 mb-1">
                      Founder of {post.users.startup_name}
                    </p>
                  )}
                  {post.users.tagline && (
                    <p className="text-sm text-gray-600 mb-4">{post.users.tagline}</p>
                  )}
                  
                  <Button variant="outline" size="sm" className="w-full hover:bg-gray-50">
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Author's Expertise */}
            {post.users.areas_of_help && post.users.areas_of_help.length > 0 && (
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {post.users.areas_of_help.map((area) => (
                      <Badge key={area} variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Related Posts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedPosts.map((relatedPost) => (
                    <div 
                      key={relatedPost.id}
                      className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors border border-gray-100"
                      onClick={() => handleRelatedPostClick(relatedPost.id)}
                    >
                      <h4 className="font-medium text-sm mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                        {relatedPost.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {relatedPost.body}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(relatedPost.created_at)}</span>
                        <div className="flex flex-wrap gap-1">
                          {relatedPost.tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            
            {/* Reading Stats */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Reading Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reading Time</span>
                  <span className="font-semibold text-gray-900">{getReadingTime(post.body)} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Word Count</span>
                  <span className="font-semibold text-gray-900">{post.body.split(' ').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Published</span>
                  <span className="font-semibold text-gray-900">{formatDate(post.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tags</span>
                  <span className="font-semibold text-gray-900">{post.tags?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 