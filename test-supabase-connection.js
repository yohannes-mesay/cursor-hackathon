// Test Supabase Connection
// Run this with: node test-supabase-connection.js

console.log('🔍 Testing Supabase Connection...\n');

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment Variables:');
console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('- SUPABASE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Environment variables missing!');
  console.log('📋 Steps to fix:');
  console.log('1. Create .env.local file in your project root');
  console.log('2. Add these lines:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here');
  console.log('3. Get values from: https://supabase.com/dashboard > Settings > API');
  process.exit(1);
}

console.log('\n✅ Environment variables are set!');
console.log('🔗 Testing connection to:', supabaseUrl);

// Test if we can reach the API
fetch(supabaseUrl + '/rest/v1/users', {
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('\n📡 API Response Status:', response.status);
  
  if (response.status === 404) {
    console.log('❌ 404 Error - Tables not created yet!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Click SQL Editor');
    console.log('3. Copy content from scripts/00-setup-database.sql');
    console.log('4. Paste in SQL editor and click RUN');
  } else if (response.status === 200) {
    console.log('✅ Connection successful!');
    return response.json();
  } else {
    console.log('⚠️  Unexpected status code');
  }
})
.then(data => {
  if (data) {
    console.log('✅ Tables exist and working!');
    console.log('📊 User count:', data?.length || 0);
  }
})
.catch(error => {
  console.log('❌ Connection failed:', error.message);
}); 