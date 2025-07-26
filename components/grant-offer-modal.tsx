"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  Gift, 
  Send,
  Info,
  CheckCircle,
  Coins,
  Target
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface GrantOfferModalProps {
  children: React.ReactNode
  startupId: string
  startupName: string
  founderName: string
}

export function GrantOfferModal({ children, startupId, startupName, founderName }: GrantOfferModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, userProfile } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    category: "general",
    timeline: "30",
    requirements: ""
  })

  const grantCategories = [
    { value: "general", label: "General Support", icon: "🎯" },
    { value: "product", label: "Product Development", icon: "🚀" },
    { value: "marketing", label: "Marketing & Growth", icon: "📈" },
    { value: "research", label: "Research & Development", icon: "🔬" },
    { value: "hiring", label: "Team Building", icon: "👥" },
    { value: "equipment", label: "Equipment & Tools", icon: "🛠️" }
  ]

  const suggestedAmounts = [500, 1000, 2500, 5000, 10000]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitGrant = async () => {
    if (!user || !formData.title || !formData.description || !formData.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const amount = parseInt(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid grant amount.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Create grant offer
      const { error } = await supabase
        .from("grant_offers")
        .insert({
          startup_id: startupId,
          offered_by_user_id: user.id,
          title: formData.title,
          description: formData.description,
          amount_offered: amount,
          category: formData.category,
          timeline_days: parseInt(formData.timeline),
          requirements: formData.requirements || null,
          status: "pending"
        })

      if (error) throw error

      toast({
        title: "Grant Offer Sent!",
        description: `Your grant offer of $${amount.toLocaleString()} has been sent to ${startupName}.`,
      })

      // Reset form and close modal
      setFormData({
        title: "",
        description: "",
        amount: "",
        category: "general",
        timeline: "30",
        requirements: ""
      })
      setOpen(false)

    } catch (error) {
      console.error("Error submitting grant offer:", error)
      toast({
        title: "Error",
        description: "Failed to submit grant offer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = grantCategories.find(cat => cat.value === formData.category)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Gift className="h-5 w-5 text-green-600" />
            <span>Offer Grant to {startupName}</span>
          </DialogTitle>
          <DialogDescription>
            Support {founderName}'s startup with a targeted grant offer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* User Token Balance Info */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Coins className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Your Token Balance</p>
                    <p className="text-sm text-gray-600">Available for grants</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {userProfile?.token_balance || 0}
                  </div>
                  <p className="text-xs text-gray-500">tokens</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grant Title */}
          <div>
            <Label htmlFor="title">Grant Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Product Development Support"
              className="mt-1"
            />
          </div>

          {/* Grant Category */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {grantCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grant Amount */}
          <div>
            <Label htmlFor="amount">Grant Amount (USD) *</Label>
            <div className="mt-1 space-y-3">
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="Enter amount"
                min="1"
              />
              <div className="flex flex-wrap gap-2">
                {suggestedAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange("amount", amount.toString())}
                    className="text-xs"
                  >
                    ${amount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Grant Description */}
          <div>
            <Label htmlFor="description">Description & Purpose *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe what this grant will help achieve..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Timeline */}
          <div>
            <Label htmlFor="timeline">Expected Timeline (days)</Label>
            <Select value={formData.timeline} onValueChange={(value) => handleInputChange("timeline", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">6 months</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requirements (Optional) */}
          <div>
            <Label htmlFor="requirements">Requirements & Milestones (Optional)</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleInputChange("requirements", e.target.value)}
              placeholder="Any specific requirements or milestones..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Info Box */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-medium text-blue-900 mb-1">How Grant Offers Work</h4>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Your offer will be sent directly to the startup founder</li>
                    <li>• Funds are held in escrow until milestones are met</li>
                    <li>• Both parties can negotiate terms before acceptance</li>
                    <li>• Transparent tracking of grant usage and progress</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <Button
              onClick={handleSubmitGrant}
              disabled={loading || !formData.title || !formData.description || !formData.amount}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Submitting...
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Grant Offer
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 