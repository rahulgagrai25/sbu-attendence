# Troubleshooting Supabase Integration

## Quick Check

1. **Check if Supabase is configured:**
   - Visit: `http://localhost:3000/api/attendance/status`
   - Should show: `{ "supabaseConfigured": true, ... }`

2. **Check browser console:**
   - Open browser DevTools (F12)
   - Look for messages starting with ✅ (success) or ❌ (error)
   - Check for Supabase-related errors

3. **Check server logs:**
   - Look at your terminal/console where the server is running
   - Check for Supabase connection errors

## Common Issues

### Issue 1: "Supabase is not configured"
**Solution:**
- Make sure `.env.local` file exists in project root
- Add these variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```
- Restart your development server after adding env variables

### Issue 2: "relation 'attendance_data' does not exist"
**Solution:**
- Go to Supabase dashboard → SQL Editor
- Run the SQL script from `supabase-setup.sql`
- Verify table exists in Table Editor

### Issue 3: Data not saving/updating
**Check:**
1. Open browser console (F12)
2. Try adding/editing a semester
3. Look for error messages
4. Check if you see "✅ Successfully wrote to Supabase" in console

### Issue 4: Data not appearing after save
**Solution:**
- The dashboard auto-refreshes every 30 seconds
- Or refresh the page manually
- Check if data appears in Supabase dashboard → Table Editor

## Testing Steps

1. **Test Supabase Connection:**
   ```
   Visit: http://localhost:3000/api/attendance/status
   ```

2. **Test Adding Data:**
   - Go to `/admin`
   - Add a new semester
   - Check browser console for success/error messages
   - Check Supabase dashboard to see if data was saved

3. **Test Reading Data:**
   - Go to dashboard (`/`)
   - Data should load automatically
   - Check browser console for "✅ Successfully read from Supabase"

## Debug Information

The system now logs detailed information:
- ✅ = Success operations
- ❌ = Error operations  
- ⚠️ = Warnings

Check both browser console and server logs for these messages.

