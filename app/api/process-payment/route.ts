import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { grantId, paymentMethod, amount, phoneNumber, accountName } = await request.json()

    if (!grantId || !paymentMethod || !amount || !phoneNumber) {
      return NextResponse.json(
        { error: "Missing required payment information" },
        { status: 400 }
      )
    }

    // Update grant payment status to processing
    const { error: updateError } = await supabase.rpc("update_grant_payment_status", {
      p_grant_id: grantId,
      p_status: "processing"
    })

    if (updateError) {
      console.error("Error updating payment status:", updateError)
      return NextResponse.json(
        { error: "Failed to update payment status" },
        { status: 500 }
      )
    }

    // Simulate payment processing (in real implementation, this would call Chappa API)
    let paymentResult
    switch (paymentMethod) {
      case "chappa":
        paymentResult = await simulateChappaPayment(amount, phoneNumber, accountName)
        break
      case "cbe_birr":
        paymentResult = await simulateCBEBirrPayment(amount, phoneNumber, accountName)
        break
      case "amole":
        paymentResult = await simulateAmolePayment(amount, phoneNumber, accountName)
        break
      case "m_pesa":
        paymentResult = await simulateMPesaPayment(amount, phoneNumber, accountName)
        break
      default:
        return NextResponse.json(
          { error: "Unsupported payment method" },
          { status: 400 }
        )
    }

    // Update payment status based on result
    const finalStatus = paymentResult.success ? "completed" : "failed"
    await supabase.rpc("update_grant_payment_status", {
      p_grant_id: grantId,
      p_status: finalStatus
    })

    return NextResponse.json({
      success: paymentResult.success,
      message: paymentResult.message,
      transactionId: paymentResult.transactionId,
      paymentStatus: finalStatus
    })

  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    )
  }
}

// Simulate Chappa payment processing
async function simulateChappaPayment(amount: number, phoneNumber: string, accountName: string) {
  // In real implementation, this would call Chappa's API
  // For now, we simulate a successful payment
  await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API delay
  
  const transactionId = `CHAPPA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return {
    success: true,
    message: `Payment of $${amount} sent to ${phoneNumber} via Chappa`,
    transactionId,
    provider: "Chappa"
  }
}

// Simulate CBE Birr payment processing
async function simulateCBEBirrPayment(amount: number, phoneNumber: string, accountName: string) {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const transactionId = `CBE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return {
    success: true,
    message: `Payment of $${amount} sent to ${phoneNumber} via CBE Birr`,
    transactionId,
    provider: "CBE Birr"
  }
}

// Simulate Amole payment processing
async function simulateAmolePayment(amount: number, phoneNumber: string, accountName: string) {
  await new Promise(resolve => setTimeout(resolve, 1800))
  
  const transactionId = `AMOLE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return {
    success: true,
    message: `Payment of $${amount} sent to ${phoneNumber} via Amole`,
    transactionId,
    provider: "Amole"
  }
}

// Simulate M-Pesa payment processing
async function simulateMPesaPayment(amount: number, phoneNumber: string, accountName: string) {
  await new Promise(resolve => setTimeout(resolve, 2200))
  
  const transactionId = `MPESA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return {
    success: true,
    message: `Payment of $${amount} sent to ${phoneNumber} via M-Pesa`,
    transactionId,
    provider: "M-Pesa"
  }
} 