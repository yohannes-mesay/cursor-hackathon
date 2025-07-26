"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface CreateGrantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateGrantDialog({ open, onOpenChange, onSuccess }: CreateGrantDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [amountRequested, setAmountRequested] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    const { error } = await supabase.from("grants").insert({
      user_id: user.id,
      title,
      description,
      amount_requested: Number.parseInt(amountRequested),
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create grant request",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Grant request created successfully!",
      })
      onSuccess()
      onOpenChange(false)
      setTitle("")
      setDescription("")
      setAmountRequested("")
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Micro-Grant</DialogTitle>
          <DialogDescription>Submit a request for community funding</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Grant Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title for your grant request"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount Requested (USD)</Label>
            <Input
              id="amount"
              type="number"
              value={amountRequested}
              onChange={(e) => setAmountRequested(e.target.value)}
              placeholder="e.g., 5000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what you need the grant for and how it will help your startup"
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
