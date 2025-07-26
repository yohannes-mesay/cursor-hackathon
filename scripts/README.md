# Database Setup Instructions

This directory contains all the SQL scripts needed to set up the Supabase database for the Inkubeta platform.

## Quick Setup (Recommended)

1. **Use the All-in-One Script:**
   - Copy the entire content of `00-setup-database.sql`
   - Paste it into your Supabase SQL editor
   - Click "Run" to execute all commands at once

## Step-by-Step Setup (Alternative)

If you prefer to run scripts individually:

### 1. Create Tables
```sql
-- Run: 01-create-tables.sql
```
This creates all 7 tables:
- `users` - User profiles and authentication data
- `startups` - Startup information linked to users
- `posts` - Blog posts and community content
- `comments` - Comments on posts (supports nested replies)
- `grants` - Funding requests from startups
- `stakes` - Token stakes on grants
- `pitches` - AI-analyzed startup pitches

### 2. Create Functions
```sql
-- Run: 02-create-functions.sql
```
This creates stored procedures:
- `increment_support_count(startup_id)` - Increments startup support
- `stake_tokens(grant_id, user_id, amount)` - Handles token staking with validation

### 3. Seed Sample Data (Optional)
```sql
-- Run: 03-seed-data.sql
```
This adds sample Ethiopian startup data for testing:
- 3 sample users with startups
- Sample posts and grants
- Realistic Ethiopian context data

## Database Schema

### Core Tables Structure

```
users
├── id (UUID, PK)
├── name, email, startup_name
├── stage, tagline, areas_of_help[]
├── token_balance (default: 10)
└── created_at

startups
├── id (UUID, PK)
├── user_id (FK → users)
├── name, tagline, stage
├── support_count
└── created_at

posts
├── id (UUID, PK)
├── user_id (FK → users)
├── title, body, tags[]
└── created_at

comments
├── id (UUID, PK)
├── post_id (FK → posts)
├── user_id (FK → users)
├── parent_comment_id (FK → comments, nullable)
├── body
└── created_at

grants
├── id (UUID, PK)
├── user_id (FK → users)
├── title, description
├── amount_requested, stake_count
└── created_at

stakes
├── id (UUID, PK)
├── grant_id (FK → grants)
├── user_id (FK → users)
├── amount
├── created_at
└── UNIQUE(grant_id, user_id)

pitches
├── id (UUID, PK)
├── user_id (FK → users)
├── content, clarity_score
├── suggestions[], local_tips[]
└── created_at
```

## TypeScript Integration

The database types are automatically generated in `lib/supabase.ts`. After running the SQL scripts, your TypeScript code will have full type safety for all database operations.

## Environment Setup

Make sure your `.env.local` file includes:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps

1. **Security**: Consider setting up Row Level Security (RLS) policies
2. **Authentication**: Configure Supabase Auth settings
3. **Testing**: Use the sample data to test your application features
4. **Production**: Remove sample data before going live

## Troubleshooting

- **Permission errors**: Make sure you're running scripts as a database admin
- **Extension errors**: The UUID extension should auto-install, but check if it's enabled
- **Foreign key errors**: Run scripts in order (tables → functions → data)

## File Structure

```
scripts/
├── 00-setup-database.sql    # Complete setup (recommended)
├── 01-create-tables.sql     # Tables only
├── 02-create-functions.sql  # Functions only
├── 03-seed-data.sql         # Sample data only
└── README.md               # This file
``` 