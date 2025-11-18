# Supabase Setup Guide

## What is Supabase?
Supabase is an open-source Firebase alternative that provides:
- PostgreSQL database (hosted)
- Real-time subscriptions
- Authentication
- Storage
- API auto-generation

## What You Need:

### 1. Supabase Account (Free Tier Available)
- Go to https://supabase.com
- Sign up for a free account
- Create a new project

### 2. Database Table Setup
You'll need to create a table in Supabase to store attendance data.

### 3. Environment Variables
You'll need to add these to your project:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

### 4. Installation
✅ Already installed! The package `@supabase/supabase-js` is already in your dependencies.

## Step-by-Step Setup:

### Step 1: Create Supabase Project
1. Visit https://supabase.com
2. Click "Start your project"
3. Sign up or log in
4. Click "New Project"
5. Fill in:
   - Project name: `attendance-dashboard` (or your choice)
   - Database password: (save this securely - you'll need it)
   - Region: Choose closest to you
6. Wait for project to be created (2-3 minutes)

### Step 2: Create Database Table
**Option A: Using SQL Editor (Recommended)**
1. In your Supabase dashboard, go to "SQL Editor"
2. Click "New Query"
3. Copy and paste the contents of `supabase-setup.sql` file
4. Click "Run" to execute the SQL

**Option B: Using Table Editor**
1. In your Supabase dashboard, go to "Table Editor"
2. Click "New Table"
3. Table name: `attendance_data`
4. Add these columns:
   - `id` (type: uuid, default: uuid_generate_v4(), primary key, unique)
   - `semester` (type: text, not null, unique)
   - `records` (type: jsonb, not null)
   - `created_at` (type: timestamp, default: now())
   - `updated_at` (type: timestamp, default: now())
5. Save the table

### Step 3: Get API Keys
1. In Supabase dashboard, go to "Settings" → "API"
2. Copy:
   - **Project URL** (under "Project URL") - looks like: `https://xxxxx.supabase.co`
   - **anon/public key** (under "Project API keys" → "anon public") - long string starting with `eyJ...`

### Step 4: Add Environment Variables

**For Local Development:**
Create a `.env.local` file in your project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**For Production (Vercel/Netlify/etc.):**
1. Go to your deployment platform's dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
4. Redeploy your application

### Step 5: Test the Setup
1. Start your development server: `npm run dev`
2. Go to `/admin` page
3. Try adding a semester - it should save to Supabase!
4. Check your Supabase dashboard → Table Editor → `attendance_data` to see the data

### Step 6: Deploy
After setting up environment variables in your deployment platform, redeploy your application. The admin panel will now use Supabase for persistent storage!

## How It Works:
- **Priority Order**: Supabase → File System → Memory Storage
- If Supabase is configured, it will be used automatically
- If Supabase fails, it falls back to file system (local) or memory (serverless)
- Data persists across deployments and server restarts when using Supabase

## Security Note:
The anon key is safe to use in client-side code. Supabase uses Row Level Security (RLS) to protect your data. The setup script creates a policy that allows all operations for simplicity. For production with authentication, you should restrict access based on user roles.

## Troubleshooting:

### "Supabase is not configured" error
- Check that your environment variables are set correctly
- Make sure variable names start with `NEXT_PUBLIC_`
- Restart your development server after adding env variables

### "relation 'attendance_data' does not exist" error
- Make sure you ran the SQL setup script
- Check that the table was created in the Table Editor

### Data not persisting
- Check Supabase dashboard to see if data is being written
- Check browser console for errors
- Verify your API keys are correct

