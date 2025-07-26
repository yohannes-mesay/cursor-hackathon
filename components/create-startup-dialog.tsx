"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

const STARTUP_STAGES = [
  { value: "idea", label: "Idea Stage" },
  { value: "mvp", label: "MVP Development" },
  { value: "growth", label: "Growth Stage" },
  { value: "scaling", label: "Scaling" },
]

interface CreateStartupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateStartupDialog({ open, onOpenChange, onSuccess }: CreateStartupDialogProps) {
  const [name, setName] = useState("")
  const [tagline, setTagline] = useState("")
  const [stage, setStage] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    const { error } = await supabase.from("startups").insert({
      user_id: user.id,
      name,
      tagline,
      stage,
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create startup",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Startup created successfully!",
      })
      onSuccess()
      onOpenChange(false)
      setName("")
      setTagline("")
      setStage("")
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Startup</DialogTitle>
          <DialogDescription>Share your startup with the Inkubeta community</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Startup Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage">Stage</Label>
            <Select value={stage} onValueChange={setStage} required>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {STARTUP_STAGES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Textarea
              id="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Describe your startup in one sentence"
              rows={2}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Startup"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
