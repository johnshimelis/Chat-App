# Quick Fix: Database Connection Issue

## The Problem
Your Neon database is likely **paused** (free tier pauses after 5 minutes of inactivity).

## Fastest Solution (30 seconds)

### Option 1: Wake Up Database (Recommended)
1. Go to https://console.neon.tech
2. Log in
3. Click on your database project
4. This automatically wakes it up
5. Wait 10-20 seconds
6. Run migration again:
   ```bash
   npx prisma migrate dev --name add_polls_reactions_insights
   ```

### Option 2: Run SQL Manually (If Option 1 doesn't work)
1. Go to https://console.neon.tech
2. Click on your database
3. Click "SQL Editor"
4. Copy and paste the contents of `migration.sql`
5. Click "Run"
6. Then run:
   ```bash
   npx prisma generate
   ```

## Why This Happens
- Neon free tier pauses databases after inactivity
- This saves resources
- Just accessing the dashboard wakes it up

## After Migration
Once migration succeeds, your app will have:
- ✅ Poll support
- ✅ Message reactions
- ✅ All new features ready!

## Still Having Issues?
Check `DATABASE_TROUBLESHOOTING.md` for more detailed solutions.
