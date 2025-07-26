Hizikyas, [7/26/25 2:37 PM]
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Wallet, CreditCard, Smartphone } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface CreateGrantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const PAYMENT_METHODS = [
  { value: "chappa", label: "Chappa", icon: Smartphone, description: "Ethiopian mobile money" },
  { value: "cbe_birr", label: "CBE Birr", icon: CreditCard, description: "Commercial Bank of Ethiopia" },
  { value: "amole", label: "Amole", icon: Wallet, description: "Digital wallet" },
  { value: "m_pesa", label: "M-Pesa", icon: Smartphone, description: "Mobile money transfer" },
]

export function CreateGrantDialog({ open, onOpenChange, onSuccess }: CreateGrantDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [amountRequested, setAmountRequested] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!paymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive",
      })
      return
    }

    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from("grants").insert({
        user_id: user.id,
        title,
        description,
        amount_requested: Number.parseInt(amountRequested),
        payment_method: paymentMethod,
        phone_number: phoneNumber,
        account_name: accountName || user.name,
      })

      if (error) {
        console.error("Database error:", error)
        toast({
          title: "Error",
          description: "Failed to create grant request",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Grant request created successfully! You'll receive funds via " + 
            PAYMENT_METHODS.find(p => p.value === paymentMethod)?.label,
        })
        onSuccess()
        onOpenChange(false)
        resetForm()
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setAmountRequested("")
    setPaymentMethod("")
    setPhoneNumber("")
    setAccountName("")
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  const getPaymentMethodInfo = () => {
    return PAYMENT_METHODS.find(p => p.value === paymentMethod)
  }

Hizikyas, [7/26/25 2:37 PM]
return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request Micro-Grant</DialogTitle>
          <DialogDescription>
            Submit a request for community funding with Ethiopian local payment integration
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Grant Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title for your grant request"
              required
            />
          </div>

          <div className="space-y-2"> 
            <Label htmlFor="amount">Amount Requested (USD) *</Label>
            <Input
              id="amount"
              type="number"
              min="100"
              max="50000"
              value={amountRequested}
              onChange={(e) => setAmountRequested(e.target.value)}
              placeholder="e.g., 5000"
              required
            />
            <p className="text-xs text-gray-500">Minimum: $100, Maximum: $50,000</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what you need the grant for and how it will help your startup"
              rows={4}
              required
            />
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Payment Method *</Label>
            <div className="grid gap-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon
                return (
                  <div
                    key={method.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === method.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod(method.value)}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{method.label}</span>
                          {paymentMethod === method.value && (
                            <Badge variant="secondary" className="text-xs">Selected</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Payment Details */}
          {paymentMethod && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Payment Details</h4>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g., +251 911 123 456"
                  required
                />
                <p className="text-xs text-gray-500">
                  This is where you'll receive the grant funds
                </p>
              </div>

Hizikyas, [7/26/25 2:37 PM]
<div className="space-y-2">
                <Label htmlFor="accountName">Account Name (Optional)</Label>
                <Input
                  id="accountName"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Name on your payment account"
                />
                <p className="text-xs text-gray-500">
                  Leave blank to use your profile name
                </p>
              </div>

              {/* Payment Method Specific Info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {getPaymentMethodInfo()?.label} Integration
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  {paymentMethod === "chappa" && 
                    "Chappa provides instant mobile money transfers across Ethiopia. Funds will be sent directly to your registered phone number."}
                  {paymentMethod === "cbe_birr" && 
                    "CBE Birr is the official digital currency platform of Commercial Bank of Ethiopia. Secure and widely accepted."}
                  {paymentMethod === "amole" && 
                    "Amole is a popular digital wallet in Ethiopia. Fast transfers and easy to use."}
                  {paymentMethod === "m_pesa" && 
                    "M-Pesa offers reliable mobile money services. Available throughout Ethiopia."}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
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