import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Chapa configuration (demo mode)
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || "CHASECK_TEST-demo-key-for-testing"
const CHAPA_BASE_URL = "https://api.chapa.co/v1"

export async function POST(request: NextRequest) {
  try {
    const { grant_id, amount, currency = "ETB", payer_info, payment_method } = await request.json()

    // Validate required fields
    if (!grant_id || !amount || !payer_info.name || !payer_info.email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get grant details
    const { data: grant, error: grantError } = await supabase
      .from("grants")
      .select("*")
      .eq("id", grant_id)
      .single()

    if (grantError || !grant) {
      return NextResponse.json(
        { success: false, error: "Grant not found" },
        { status: 404 }
      )
    }

    // Generate unique transaction reference
    const tx_ref = `inkubeta_${grant_id}_${Date.now()}`

    // Prepare Chapa payment data
    const chapaPayload = {
      amount: amount.toString(),
      currency: currency,
      email: payer_info.email,
      first_name: payer_info.name.split(' ')[0] || payer_info.name,
      last_name: payer_info.name.split(' ').slice(1).join(' ') || '',
      phone_number: payer_info.phone || '',
      tx_ref: tx_ref,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chapa-callback`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment-success`,
      description: `Payment for grant: ${grant.title}`,
      customization: {
        title: "Inkubeta Grant Funding",
        description: `Supporting ${grant.title}`,
        logo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/placeholder-logo.svg`
      }
    }

    // For demo purposes, we'll simulate the Chapa API call
    // In production, you would make an actual API call to Chapa
    const isDemo = true
    
    let chapaResponse
    if (isDemo) {
      // Demo mode - simulate successful response
      chapaResponse = {
        message: "Hosted Link",
        status: "success",
        data: {
          checkout_url: `https://checkout.chapa.co/checkout/payment/${tx_ref}?demo=true`
        }
      }
    } else {
      // Production mode - actual Chapa API call
      const response = await fetch(`${CHAPA_BASE_URL}/hosted/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(chapaPayload)
      })
      
      chapaResponse = await response.json()
    }

    if (chapaResponse.status === "success") {
      // Store payment record in database
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          grant_id: grant_id,
          payer_id: payer_info.user_id || null,
          amount: amount,
          currency: currency,
          payment_method: payment_method,
          chapa_transaction_id: tx_ref,
          chapa_payment_status: "pending"
        })

      if (paymentError) {
        console.error("Failed to store payment record:", paymentError)
      }

      return NextResponse.json({
        success: true,
        checkout_url: chapaResponse.data.checkout_url,
        transaction_ref: tx_ref
      })
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to initialize payment" },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("Payment API error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Handle Chapa webhook callbacks
export async function PATCH(request: NextRequest) {
  try {
    const { tx_ref, status, amount } = await request.json()

    // Update payment status
    const { error: updateError } = await supabase
      .from("payments")
      .update({ 
        chapa_payment_status: status,
        payment_date: new Date().toISOString()
      })
      .eq("chapa_transaction_id", tx_ref)

    if (updateError) {
      console.error("Failed to update payment status:", updateError)
      return NextResponse.json({ success: false }, { status: 500 })
    }

    // If payment successful, update grant funding
    if (status === "success") {
      const { data: payment } = await supabase
        .from("payments")
        .select("grant_id, amount")
        .eq("chapa_transaction_id", tx_ref)
        .single()

      if (payment) {
        await supabase.rpc("update_grant_funding", {
          p_grant_id: payment.grant_id,
          p_amount: payment.amount
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Callback error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
} 