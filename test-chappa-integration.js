// Test script for Chappa integration and Ethiopian payment methods
// Run this to verify your payment integration setup

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Environment variables not found!')
  console.log('Please create a .env.local file with:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your-project-url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testChappaIntegration() {
  console.log('🧪 Testing Chappa Integration & Ethiopian Payment Methods...\n')

  try {
    // Test 1: Check if grants table has payment fields
    console.log('1. Testing grants table payment fields...')
    const { data: grants, error: grantsError } = await supabase
      .from('grants')
      .select('payment_method, phone_number, account_name, payment_status')
      .limit(1)
    
    if (grantsError) {
      console.log('❌ Error accessing grants table:', grantsError.message)
      console.log('   Make sure you\'ve run scripts/05-add-payment-fields.sql')
      return
    }
    
    console.log('✅ Grants table has payment fields')
    console.log('   Payment fields available: payment_method, phone_number, account_name, payment_status\n')

    // Test 2: Check if payment status update function exists
    console.log('2. Testing payment status update function...')
    const { error: functionError } = await supabase.rpc('update_grant_payment_status', {
      p_grant_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      p_status: 'pending'
    })
    
    if (functionError) {
      console.log('❌ Error testing payment status function:', functionError.message)
      console.log('   Make sure you\'ve run scripts/05-add-payment-fields.sql')
    } else {
      console.log('✅ Payment status update function accessible\n')
    }

    // Test 3: Test payment processing API
    console.log('3. Testing payment processing API...')
    const testPaymentData = {
      grantId: '00000000-0000-0000-0000-000000000000',
      paymentMethod: 'chappa',
      amount: 1000,
      phoneNumber: '+251911123456',
      accountName: 'Test User'
    }

    try {
      const response = await fetch('http://localhost:3000/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPaymentData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Payment processing API accessible')
        console.log(`   Test result: ${result.success ? 'Success' : 'Failed'}`)
      } else {
        console.log('⚠️  Payment API returned error (this is expected for dummy data)')
        console.log('   Status:', response.status)
      }
    } catch (apiError) {
      console.log('⚠️  Payment API not accessible (server may not be running)')
      console.log('   Error:', apiError.message)
    }

    console.log('\n🎉 Chappa Integration Tests Completed!')
    console.log('\n📝 How to test the full functionality:')
    console.log('1. Start your development server: npm run dev')
    console.log('2. Run the database migration: scripts/05-add-payment-fields.sql')
    console.log('3. Navigate to the Grants tab')
    console.log('4. Click "Request Grant"')
    console.log('5. Select "Chappa" as payment method')
    console.log('6. Enter your phone number and submit')
    console.log('7. Check that payment information appears in the grants feed')

    console.log('\n🏦 Supported Payment Methods:')
    console.log('   • Chappa - Ethiopian mobile money')
    console.log('   • CBE Birr - Commercial Bank of Ethiopia')
    console.log('   • Amole - Digital wallet')
    console.log('   • M-Pesa - Mobile money transfer')

  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
  }
}

testChappaIntegration() 