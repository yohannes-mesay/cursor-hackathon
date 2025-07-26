"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, MessageCircle, Search, Filter } from "lucide-react"
import { supabase } from "@/lib/supabase"
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
      setAvailableTags([...new Set(allTags)])
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

  const PostSkeleton = () => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-48" />
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
          <Skeleton className="h-8 w-20" />
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
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
          Write Post
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search posts, content, tags, or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-48">
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

      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                  <CardDescription>
                    by {post.users.name} • {new Date(post.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4 line-clamp-3">{post.body}</p>

              <div className="flex justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  {post.tags?.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="text-xs cursor-pointer hover:bg-gray-200"
                      onClick={() => setTagFilter(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Discuss
                </Button>
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
              : "Be the first to write a post!"}
          </div>
        </div>
      )}

      <CreatePostDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={fetchPosts} />
    </div>
  )
}
