# 🔧 Supabase Setup & Debugging Guide

## ❌ Current Issue: 404 Error & Empty Tables

You're getting a 404 error because the database tables haven't been created yet. Let's fix this step by step.

## 🚀 STEP-BY-STEP SOLUTION

### 1. Configure Environment Variables

**Create `.env.local` file:**
```bash
# Copy the template file and update with your credentials
cp .env.local.template .env.local
```

**Get your Supabase credentials:**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Update `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### 2. Create Database Tables

**Option A: Quick Setup (Recommended)**
1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Copy the entire content from `scripts/00-setup-database.sql`
4. Paste it into the SQL editor
5. Click **RUN** button

**Option B: Manual Step-by-Step**
1. Run `scripts/01-create-tables.sql` first
2. Then run `scripts/02-create-functions.sql`
3. Finally run `scripts/03-seed-data.sql` (optional)

### 3. Verify Tables Are Created

**Check in Supabase Dashboard:**
1. Go to **Table Editor** in your Supabase dashboard
2. You should see 7 tables:
   - ✅ users
   - ✅ startups
   - ✅ posts
   - ✅ comments
   - ✅ grants
   - ✅ stakes
   - ✅ pitches

### 4. Test the API

**Restart your development server:**
```bash
npm run dev
```

**Test the endpoint:**
```bash
# This should now return data instead of 404
curl https://your-project-id.supabase.co/rest/v1/users \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

## 🐛 Common Issues & Solutions

### Issue 1: Still getting 404 after running SQL
- **Solution**: Make sure you ran the SQL in the correct project
- **Check**: Verify the project URL in your browser matches your `.env.local`

### Issue 2: Permission denied errors
- **Solution**: Make sure you're logged into Supabase dashboard as the project owner
- **Alternative**: Use the project owner's account to run SQL scripts

### Issue 3: Environment variables not loading
- **Solution**: Restart your Next.js server after changing `.env.local`
- **Check**: Make sure `.env.local` is in the root directory (same level as `package.json`)

### Issue 4: Foreign key constraint errors
- **Solution**: Run scripts in order: tables → functions → data
- **Alternative**: Use the all-in-one script `00-setup-database.sql`

## 🔍 Debugging Checklist

```bash
# 1. Check if environment file exists
ls -la .env.local

# 2. Verify Supabase dependency is installed
npm list @supabase/supabase-js

# 3. Check if Next.js can read environment variables
# Add this to any component temporarily:
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

# 4. Test Supabase connection
# Add this to any component:
import { supabase } from '@/lib/supabase'
console.log('Supabase client:', supabase)
```

## 📝 Quick Verification Script

Create a test file to verify everything works:

```typescript
// test-supabase.ts
import { supabase } from './lib/supabase'

async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count(*)')
    if (error) {
      console.error('❌ Connection failed:', error.message)
    } else {
      console.log('✅ Connection successful:', data)
    }
  } catch (err) {
    console.error('❌ Error:', err)
  }
}

testConnection()
```

## 🎯 Expected Results

After completing these steps:
- ✅ No more 404 errors
- ✅ Table editor shows 7 tables
- ✅ API endpoints respond correctly
- ✅ Your app can connect to Supabase
- ✅ Sample data appears in tables (if you ran seed script)

## 🆘 Still Having Issues?

1. **Double-check your project URL** - make sure it's exactly right
2. **Verify API key** - copy-paste carefully, no extra spaces
3. **Check project status** - make sure your Supabase project is active
4. **Browser cache** - try in incognito mode
5. **Network issues** - try from a different network

---

💡 **Pro Tip**: The most common issue is forgetting to actually run the SQL scripts in the Supabase SQL Editor. Make sure you click the RUN button after pasting the SQL! 