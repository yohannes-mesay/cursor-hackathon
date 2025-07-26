"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react"

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const verifyPayment = async () => {
      const trx_ref = searchParams.get('trx_ref')
      const status = searchParams.get('status')

      if (!trx_ref) {
        setStatus('failed')
        return
      }

      // In a real app, you'd verify the payment with your backend
      // For demo purposes, we'll simulate based on URL params
      setTimeout(() => {
        if (status === 'success') {
          setStatus('success')
          setPaymentDetails({
            transaction_ref: trx_ref,
            amount: searchParams.get('amount') || '0',
            currency: 'ETB'
          })
        } else {
          setStatus('failed')
        }
      }, 2000)
    }

    verifyPayment()
  }, [searchParams])

  const handleBackToDashboard = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 mx-auto text-blue-600 animate-spin" />
              <CardTitle>Verifying Payment</CardTitle>
              <CardDescription>Please wait while we confirm your payment...</CardDescription>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
              <CardTitle className="text-green-600">Payment Successful!</CardTitle>
              <CardDescription>Thank you for supporting this grant request</CardDescription>
            </>
          )}
          
          {status === 'failed' && (
            <>
              <XCircle className="h-12 w-12 mx-auto text-red-600" />
              <CardTitle className="text-red-600">Payment Failed</CardTitle>
              <CardDescription>Something went wrong with your payment</CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'success' && paymentDetails && (
            <div className="space-y-3 p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-medium">{paymentDetails.amount} {paymentDetails.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs">{paymentDetails.transaction_ref}</span>
              </div>
              <div className="text-xs text-gray-500 text-center mt-2">
                Your contribution will help bring this project to life!
              </div>
            </div>
          )}
          
          {status === 'failed' && (
            <div className="space-y-3 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600 text-center">
                Your payment could not be processed. Please try again or contact support if the issue persists.
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleBackToDashboard}
            className="w-full"
            variant={status === 'success' ? 'default' : 'outline'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 