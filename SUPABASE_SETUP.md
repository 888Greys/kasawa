# Supabase Setup Guide for Kasawa

## Phase 1: Project Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in the details:
   - **Organization:** Create new or use existing
   - **Project name:** `kasawa-cannabis`
   - **Database password:** Create a strong password (save this!)
   - **Region:** Choose closest to your users
4. Click "Create new project"

### 2. Get Your Project Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### 3. Configure Environment Variables

1. Create a `.env.local` file in your project root:
```bash
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace the placeholder values with your actual Supabase credentials

### 4. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the SQL script

This will create:
- ✅ Users table
- ✅ Products table
- ✅ Cart items table
- ✅ Orders table
- ✅ Order items table
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Automatic updated_at triggers

### 5. Verify Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see all 5 tables created
3. Check that RLS is enabled on all tables

## Next Steps

Once Phase 1 is complete, we'll move to:
- **Phase 2:** Migrate products to database
- **Phase 3:** Add real authentication
- **Phase 4:** Implement persistent cart
- **Phase 5:** Add order management

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error:**
   - Double-check your anon key is correct
   - Make sure you're using the anon key, not the service role key

2. **"Table not found" error:**
   - Run the schema.sql script again
   - Check that all tables were created in the Table Editor

3. **RLS policy errors:**
   - Ensure RLS is enabled on all tables
   - Check that policies are created correctly

### Support:
- Supabase Documentation: [supabase.com/docs](https://supabase.com/docs)
- Supabase Discord: [discord.gg/supabase](https://discord.gg/supabase) 