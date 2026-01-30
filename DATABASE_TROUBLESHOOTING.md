# Database Connection Troubleshooting

## Issue: Can't reach database server

This error usually means:
1. **Database is paused** (Neon free tier pauses after inactivity)
2. **Network/firewall blocking connection**
3. **Connection string issue**

## Solutions

### Solution 1: Wake Up Neon Database (Most Common)

Neon free tier databases pause after 5 minutes of inactivity. To wake it up:

1. **Go to Neon Dashboard**
   - Visit https://console.neon.tech
   - Log in to your account
   - Find your database project

2. **Wake Up Database**
   - Click on your database
   - It should automatically wake up when you access it
   - Wait 10-20 seconds for it to fully start

3. **Try Migration Again**
   ```bash
   npx prisma migrate dev --name add_polls_reactions_insights
   ```

### Solution 2: Use Direct Connection (Not Pooler)

If pooler connection fails, try direct connection:

1. **Get Direct Connection String**
   - In Neon dashboard, go to your database
   - Click "Connection Details"
   - Copy the **Direct connection** string (not pooler)
   - It should look like: `postgresql://user:pass@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

2. **Update .env File**
   ```
   DATABASE_URL="postgresql://neondb_owner:npg_CSmK5lsQoth4@ep-bitter-glade-ah6jcp55.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```
   (Remove `-pooler` from the hostname)

3. **Try Migration Again**

### Solution 3: Check Connection String Format

Make sure your connection string:
- Has no line breaks
- Has proper SSL mode: `?sslmode=require`
- Has correct credentials
- Uses correct hostname

### Solution 4: Test Connection First

Before running migration, test the connection:

```bash
node check-db.ts
```

If this works, the database is accessible. If not, it's likely paused.

### Solution 5: Alternative - Create Migration SQL Manually

If connection keeps failing, you can create the tables manually:

1. **Connect to Neon via SQL Editor**
   - Go to Neon dashboard
   - Click "SQL Editor"
   - Run this SQL:

```sql
-- Add type and metadata columns to Message table
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "type" TEXT DEFAULT 'text';
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "metadata" TEXT;

-- Create Reaction table
CREATE TABLE IF NOT EXISTS "Reaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "emoji" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Reaction_messageId_userId_emoji_key" ON "Reaction"("messageId", "userId", "emoji");

-- Create Poll table
CREATE TABLE IF NOT EXISTS "Poll" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL UNIQUE,
    "question" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create PollVote table
CREATE TABLE IF NOT EXISTS "PollVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pollId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "optionIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PollVote_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "PollVote_pollId_userId_key" ON "PollVote"("pollId", "userId");
```

2. **Mark Migration as Applied**
   ```bash
   npx prisma migrate resolve --applied add_polls_reactions_insights
   ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

## Quick Fix Steps

1. ✅ Go to https://console.neon.tech
2. ✅ Click on your database (this wakes it up)
3. ✅ Wait 10-20 seconds
4. ✅ Try migration again: `npx prisma migrate dev --name add_polls_reactions_insights`

## If Still Failing

1. Check Neon dashboard for any errors
2. Verify your database is active (not paused)
3. Try direct connection string instead of pooler
4. Check if your IP is blocked (unlikely)
5. Contact Neon support if issue persists

## For Production (Vercel)

When deploying to Vercel:
- Use the **pooler connection string** (better for serverless)
- Make sure database is not paused
- Vercel will handle connection pooling automatically
