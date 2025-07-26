"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Banknote, Smartphone, DollarSign, Users, Calendar, Target } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface Grant {
  id: string
  title: string
  description: string
  amount_requested: number
  stake_count: number
  total_funded?: number
  funding_percentage?: number
  created_at: string
  users: {
    name: string
  }
}

interface GrantPaymentModalProps {
  grant: Grant | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaymentSuccess: () => void
}

export function GrantPaymentModal({ grant, open, onOpenChange, onPaymentSuccess }: GrantPaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<string>("chapa")
  const [loading, setLoading] = useState(false)
  const [payerInfo, setPayerInfo] = useState({
    name: "",
    email: "",
    phone: ""
  })
  
  const { user, userProfile } = useAuth()
  const { toast } = useToast()

  if (!grant) return null

  const remainingAmount = grant.amount_requested - (grant.total_funded || 0)
  const fundingPercentage = grant.funding_percentage || 0
  const isFullyFunded = fundingPercentage >= 100

  const handlePayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      })
      return
    }

    if (paymentAmount > remainingAmount && !isFullyFunded) {
      toast({
        title: "Error", 
        description: `Amount exceeds remaining funding needed (${remainingAmount.toLocaleString()} ETB)`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/chapa-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_id: grant.id,
          amount: paymentAmount,
          currency: "ETB",
          payer_info: payerInfo,
          payment_method: paymentMethod,
        }),
      })

      const data = await response.json()

      if (data.success && data.checkout_url) {
        // Redirect to Chapa payment page
        window.open(data.checkout_url, "_blank")
        
        toast({
          title: "Payment Initiated",
          description: "You will be redirected to Chapa payment page",
        })
        
        onPaymentSuccess()
        onOpenChange(false)
      } else {
        toast({
          title: "Payment Failed",
          description: data.error || "Failed to initiate payment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const suggestedAmounts = [
    Math.min(100, remainingAmount),
    Math.min(500, remainingAmount),
    Math.min(1000, remainingAmount),
    remainingAmount
  ].filter(amount => amount > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Fund Grant Request
          </DialogTitle>
          <DialogDescription>
            Support {grant.users.name}'s grant request with real funding
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Grant Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{grant.title}</CardTitle>
              <CardDescription className="text-sm">{grant.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Funding Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Funding Progress</span>
                  <span>{fundingPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={fundingPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{(grant.total_funded || 0).toLocaleString()} ETB raised</span>
                  <span>{grant.amount_requested.toLocaleString()} ETB goal</span>
                </div>
              </div>

              {/* Grant Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <Users className="h-4 w-4 mx-auto text-blue-600" />
                  <div className="text-sm font-medium">{grant.stake_count}</div>
                  <div className="text-xs text-gray-600">Community Stakes</div>
                </div>
                <div className="space-y-1">
                  <Target className="h-4 w-4 mx-auto text-green-600" />
                  <div className="text-sm font-medium">{remainingAmount.toLocaleString()} ETB</div>
                  <div className="text-xs text-gray-600">Still Needed</div>
                </div>
                <div className="space-y-1">
                  <Calendar className="h-4 w-4 mx-auto text-purple-600" />
                  <div className="text-sm font-medium">{new Date(grant.created_at).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-600">Posted</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Payment Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Make a Payment</h3>
            
            {/* Payment Amount */}
            <div className="space-y-3">
              <Label htmlFor="amount">Payment Amount (ETB)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                max={remainingAmount}
                value={paymentAmount || ""}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                placeholder="Enter amount in Ethiopian Birr"
              />
              
              {/* Suggested Amounts */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Quick amounts:</span>
                {suggestedAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentAmount(amount)}
                  >
                    {amount.toLocaleString()} ETB
                  </Button>
                ))}
              </div>
            </div>

            {/* Payer Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payer-name">Full Name</Label>
                <Input
                  id="payer-name"
                  value={payerInfo.name}
                  onChange={(e) => setPayerInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payer-email">Email</Label>
                <Input
                  id="payer-email"
                  type="email"
                  value={payerInfo.email}
                  onChange={(e) => setPayerInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payer-phone">Phone</Label>
                <Input
                  id="payer-phone"
                  value={payerInfo.phone}
                  onChange={(e) => setPayerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+251..."
                />
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card 
                  className={`cursor-pointer transition-colors ${paymentMethod === 'chapa' ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setPaymentMethod('chapa')}
                >
                  <CardContent className="p-4 text-center">
                    <CreditCard className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-sm font-medium">Chapa</div>
                    <div className="text-xs text-gray-600">Cards & Mobile Money</div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-colors ${paymentMethod === 'telebirr' ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setPaymentMethod('telebirr')}
                >
                  <CardContent className="p-4 text-center">
                    <Smartphone className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <div className="text-sm font-medium">TeleBirr</div>
                    <div className="text-xs text-gray-600">Mobile Payment</div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-colors ${paymentMethod === 'bank' ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setPaymentMethod('bank')}
                >
                  <CardContent className="p-4 text-center">
                    <Banknote className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-sm font-medium">Bank Transfer</div>
                    <div className="text-xs text-gray-600">CBE Birr & Others</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Payment Summary */}
            {paymentAmount > 0 && (
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Payment:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {paymentAmount.toLocaleString()} ETB
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Processing via {paymentMethod === 'chapa' ? 'Chapa' : paymentMethod === 'telebirr' ? 'TeleBirr' : 'Bank Transfer'}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Button */}
            <Button 
              onClick={handlePayment}
              disabled={loading || !paymentAmount || !payerInfo.name || !payerInfo.email}
              className="w-full"
              size="lg"
            >
              {loading ? "Processing..." : `Pay ${paymentAmount?.toLocaleString() || 0} ETB`}
            </Button>

            {/* Disclaimer */}
            <div className="text-xs text-gray-600 text-center">
              🔒 Secure payment powered by Chapa. Your payment will directly fund this grant request.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 