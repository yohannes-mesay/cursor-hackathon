"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Coins, 
  CreditCard, 
  Wallet, 
  TrendingUp,
  History,
  Plus,
  ArrowRight,
  DollarSign,
  Zap
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface TokenModalProps {
  children: React.ReactNode
}

export function TokenModal({ children }: TokenModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tokenAmount, setTokenAmount] = useState(100)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const { user, userProfile } = useAuth()
  const { toast } = useToast()

  const tokenPackages = [
    { tokens: 100, price: 10, bonus: 0, popular: false },
    { tokens: 500, price: 45, bonus: 50, popular: true },
    { tokens: 1000, price: 80, bonus: 200, popular: false },
    { tokens: 2500, price: 200, bonus: 500, popular: false },
  ]

  const mockTransactions = [
    { id: 1, type: "purchase", amount: 100, date: "2024-01-15", description: "Token purchase" },
    { id: 2, type: "spend", amount: -25, date: "2024-01-14", description: "Grant support" },
    { id: 3, type: "spend", amount: -15, date: "2024-01-13", description: "Startup support" },
    { id: 4, type: "purchase", amount: 500, date: "2024-01-10", description: "Token purchase" },
  ]

  const handleBuyTokens = async (packageTokens: number, packagePrice: number) => {
    if (!user) return
    
    setLoading(true)
    try {
      // Mock payment processing - in real app, integrate with payment provider
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update user's token balance
      const newBalance = (userProfile?.token_balance || 0) + packageTokens
      const { error } = await supabase
        .from("users")
        .update({ token_balance: newBalance })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Success!",
        description: `Successfully purchased ${packageTokens} tokens for $${packagePrice}`,
      })
      
      setOpen(false)
    } catch (error) {
      console.error("Error purchasing tokens:", error)
      toast({
        title: "Error",
        description: "Failed to purchase tokens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    return type === "purchase" ? (
      <div className="p-2 bg-green-100 rounded-full">
        <Plus className="h-4 w-4 text-green-600" />
      </div>
    ) : (
      <div className="p-2 bg-blue-100 rounded-full">
        <ArrowRight className="h-4 w-4 text-blue-600" />
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span>Token Management</span>
          </DialogTitle>
          <DialogDescription>
            Buy tokens to support startups and access premium features.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="buy">Buy Tokens</TabsTrigger>
            <TabsTrigger value="balance">Balance</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4 mt-4">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Wallet className="h-6 w-6 text-yellow-500" />
                <span className="text-2xl font-bold">{userProfile?.token_balance || 0}</span>
                <span className="text-sm text-gray-600">tokens</span>
              </div>
              <p className="text-sm text-gray-600">Current balance</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {tokenPackages.map((pkg, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    pkg.popular ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Coins className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{pkg.tokens} tokens</span>
                            {pkg.popular && (
                              <Badge className="bg-blue-500 text-white text-xs">Popular</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            ${pkg.price}
                            {pkg.bonus > 0 && (
                              <span className="text-green-600 ml-2">+{pkg.bonus} bonus!</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleBuyTokens(pkg.tokens + pkg.bonus, pkg.price)}
                        disabled={loading}
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Buy
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">What can you do with tokens?</h4>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Support promising startups</li>
                    <li>• Stake in micro-grant requests</li>
                    <li>• Access premium collaboration features</li>
                    <li>• Boost your posts and visibility</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="balance" className="space-y-4 mt-4">
            <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-yellow-100 rounded-full">
                  <Coins className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {userProfile?.token_balance || 0}
              </div>
              <p className="text-gray-600">Available Tokens</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <div className="text-lg font-semibold">24</div>
                  <p className="text-xs text-gray-600">Tokens Earned</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <ArrowRight className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-lg font-semibold">156</div>
                  <p className="text-xs text-gray-600">Tokens Spent</p>
                </CardContent>
              </Card>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Token Value</h4>
              <p className="text-sm text-gray-600">
                1 token = $0.10 USD (approximate value for platform activities)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {mockTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getTransactionIcon(transaction.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{transaction.description}</span>
                      <span className={`font-semibold text-sm ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{transaction.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Showing recent transactions</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 