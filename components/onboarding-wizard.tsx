"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

const HELP_AREAS = ["funding", "mentorship", "technical", "partnerships", "scaling", "marketing", "legal", "operations"]

const STARTUP_STAGES = [
  { value: "idea", label: "Idea Stage" },
  { value: "mvp", label: "MVP Development" },
  { value: "growth", label: "Growth Stage" },
  { value: "scaling", label: "Scaling" },
]

export function OnboardingWizard() {
  const [startupName, setStartupName] = useState("")
  const [stage, setStage] = useState("")
  const [tagline, setTagline] = useState("")
  const [areasOfHelp, setAreasOfHelp] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { updateProfile } = useAuth()
  const { toast } = useToast()

  const handleAreaToggle = (area: string) => {
    setAreasOfHelp((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile({
        startup_name: startupName,
        stage,
        tagline,
        areas_of_help: areasOfHelp,
      })

      toast({
        title: "Profile completed!",
        description: "Welcome to Inkubeta!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">Complete Your Profile</CardTitle>
          <CardDescription>Tell us about your startup to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="startup-name">Startup Name</Label>
              <Input
                id="startup-name"
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                placeholder="e.g., EthioTech"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage">Current Stage</Label>
              <Select value={stage} onValueChange={setStage} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your startup stage" />
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
              <Label htmlFor="tagline">One-liner Tagline</Label>
              <Textarea
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Describe your startup in one compelling sentence"
                rows={2}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Areas where you need help</Label>
              <div className="grid grid-cols-2 gap-3">
                {HELP_AREAS.map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={area}
                      checked={areasOfHelp.includes(area)}
                      onCheckedChange={() => handleAreaToggle(area)}
                    />
                    <Label htmlFor={area} className="capitalize">
                      {area}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Setting up your profile..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
