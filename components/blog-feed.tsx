"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Filter, ExternalLink, Calendar, User, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { CreatePostDialog } from "@/components/create-post-dialog"

interface Post {
  id: string
  title: string
  body: string
  tags: string[]
  created_at: string
  users: {
    name: string
  }
}

export function BlogFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [tagFilter, setTagFilter] = useState("all")
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const router = useRouter()
  const { userProfile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchQuery, tagFilter])

  const fetchPosts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        users (name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      })
    } else {
      setPosts(data || [])
      // Extract unique tags
      const allTags = data?.flatMap(post => post.tags || []) || []
      const uniqueTags = Array.from(new Set(allTags))
      setAvailableTags(uniqueTags)
    }
    setLoading(false)
  }

  const filterPosts = () => {
    let filtered = posts

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Tag filter
    if (tagFilter !== "all") {
      filtered = filtered.filter((post) => post.tags?.includes(tagFilter))
    }

    setFilteredPosts(filtered)
  }

  const handleCardClick = (postId: string) => {
    router.push(`/blog/${postId}`)
  }

  const getReadingTime = (text: string) => {
    const wordsPerMinute = 200
    const wordCount = text.split(' ').length
    const readingTime = Math.ceil(wordCount / wordsPerMinute)
    return readingTime
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const PostSkeleton = () => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
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
            <PostSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Community Blog</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search posts, content, authors, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {availableTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredPosts.length} of {posts.length} posts
        {searchQuery && ` for "${searchQuery}"`}
        {tagFilter !== "all" && ` tagged with "${tagFilter}"`}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => (
          <Card 
            key={post.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => handleCardClick(post.id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors flex items-start justify-between line-clamp-2">
                <span className="flex-1 mr-2">{post.title}</span>
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
              </CardTitle>
              <CardDescription className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  {post.users.name}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(post.created_at)}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {getReadingTime(post.body)} min
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {post.body}
              </p>
              <div className="flex flex-wrap gap-2">
                {post.tags?.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {post.tags && post.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{post.tags.length - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No posts found</div>
          <div className="text-sm text-gray-400">
            {searchQuery || tagFilter !== "all" 
              ? "Try adjusting your search or filters" 
              : "Be the first to create a post!"}
          </div>
        </div>
      )}

      <CreatePostDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={fetchPosts} />
    </div>
  )
}
