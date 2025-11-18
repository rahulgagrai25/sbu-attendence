# Deployment Checklist for Supabase Integration

## Before Deploying:

### 1. Verify Supabase Setup
- [ ] Created Supabase project at https://supabase.com
- [ ] Ran the SQL script from `supabase-setup.sql` in Supabase SQL Editor
- [ ] Verified table `attendance_data` exists in Table Editor
- [ ] Checked that RLS policies are set (or disabled for testing)

### 2. Environment Variables (CRITICAL)
Add these in your deployment platform (Vercel/Netlify/etc.):

**Required Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find them:**
- Supabase Dashboard → Settings → API
- Copy "Project URL" and "anon public" key

### 3. Verify Environment Variables
After adding variables:
- [ ] Redeploy your application
- [ ] Check deployment logs for any Supabase connection errors
- [ ] Test admin panel - add/edit/delete operations should work

### 4. Test Checklist
- [ ] Add a new semester → Should save to Supabase
- [ ] Edit an existing semester → Should update in Supabase
- [ ] Delete a semester → Should remove from Supabase
- [ ] Refresh dashboard → Should show latest data from Supabase
- [ ] Check Supabase dashboard → Verify data appears in `attendance_data` table

### 5. Troubleshooting

**If admin panel shows errors:**
1. Check browser console for error messages
2. Check deployment logs/server logs
3. Verify environment variables are set correctly
4. Ensure table exists in Supabase
5. Check RLS policies allow operations

**Common Issues:**
- "Supabase is not configured" → Environment variables missing
- "relation 'attendance_data' does not exist" → Table not created
- "permission denied" → RLS policies blocking access
- "Failed to write to Supabase" → Check network/API keys

### 6. Verify Data Persistence
- [ ] Add data in admin panel
- [ ] Check Supabase Table Editor - data should appear
- [ ] Restart/redeploy application
- [ ] Data should still be there (persistent storage working!)

## Quick Test Command
After deployment, test the API:
```bash
curl https://your-app-url/api/attendance
```
Should return JSON array of semesters.

