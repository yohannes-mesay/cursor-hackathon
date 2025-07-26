"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, MessageCircle } from "lucide-react"
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
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
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
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-8">Loading posts...</div>
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

      <div className="space-y-4">
        {posts.map((post) => (
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
                    <Badge key={tag} variant="secondary" className="text-xs">
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

      <CreatePostDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={fetchPosts} />
    </div>
  )
}
