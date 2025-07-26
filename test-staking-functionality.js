// Test script for staking functionality
// Run this to verify your Supabase setup is working correctly

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

async function testStakingFunctionality() {
  console.log('🧪 Testing Staking Functionality...\n')

  try {
    // Test 1: Check if grants table exists
    console.log('1. Testing grants table access...')
    const { data: grants, error: grantsError } = await supabase
      .from('grants')
      .select('count(*)')
    
    if (grantsError) {
      console.log('❌ Error accessing grants table:', grantsError.message)
      console.log('   Make sure you\'ve run the SQL scripts in your Supabase dashboard')
      return
    }
    
    console.log('✅ Grants table accessible')
    console.log(`   Current grants count: ${grants[0].count}\n`)

    // Test 2: Check if stakes table exists
    console.log('2. Testing stakes table access...')
    const { data: stakes, error: stakesError } = await supabase
      .from('stakes')
      .select('count(*)')
    
    if (stakesError) {
      console.log('❌ Error accessing stakes table:', stakesError.message)
      return
    }
    
    console.log('✅ Stakes table accessible')
    console.log(`   Current stakes count: ${stakes[0].count}\n`)

    // Test 3: Test the stake_tokens function
    console.log('3. Testing staking function...')
    const { error: functionError } = await supabase.rpc('stake_tokens', {
      p_grant_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      p_user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      p_amount: 1
    })
    
    if (functionError) {
      console.log('❌ Error testing staking function:', functionError.message)
      console.log('   Make sure you\'ve run scripts/02-create-functions.sql')
    } else {
      console.log('✅ Staking function accessible')
    }

    console.log('\n🎉 All tests completed!')
    console.log('\n📝 How to test the full functionality:')
    console.log('1. Start your development server: npm run dev')
    console.log('2. Sign in to your account')
    console.log('3. Navigate to the Grants tab')
    console.log('4. Click "Stake Tokens" on any grant')
    console.log('5. Check that your token balance decreases in the header')
    console.log('6. Verify the grant\'s stake count increases')

  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
  }
}

testStakingFunctionality() 