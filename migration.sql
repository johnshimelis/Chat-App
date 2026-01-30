-- Manual Migration SQL for Polls and Reactions
-- Run this in Neon SQL Editor if Prisma migration fails

-- Add type and metadata columns to Message table (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Message' AND column_name='type') THEN
        ALTER TABLE "Message" ADD COLUMN "type" TEXT DEFAULT 'text';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Message' AND column_name='metadata') THEN
        ALTER TABLE "Message" ADD COLUMN "metadata" TEXT;
    END IF;
END $$;

-- Create Reaction table
CREATE TABLE IF NOT EXISTS "Reaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "emoji" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique index for Reaction
CREATE UNIQUE INDEX IF NOT EXISTS "Reaction_messageId_userId_emoji_key" ON "Reaction"("messageId", "userId", "emoji");

-- Create Poll table
CREATE TABLE IF NOT EXISTS "Poll" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL UNIQUE,
    "question" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Poll_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE
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

-- Create unique index for PollVote
CREATE UNIQUE INDEX IF NOT EXISTS "PollVote_pollId_userId_key" ON "PollVote"("pollId", "userId");

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('Reaction', 'Poll', 'PollVote');
