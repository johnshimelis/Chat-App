# Database Migration Instructions

## Step 1: Update Database Schema

The schema has been extended with new models for polls and reactions. You need to run a migration:

```bash
npx prisma migrate dev --name add_polls_reactions_insights
```

Or if you prefer to generate the migration first:

```bash
npx prisma migrate dev --create-only --name add_polls_reactions_insights
npx prisma migrate dev
```

## Step 2: Generate Prisma Client

After migration, regenerate the Prisma client:

```bash
npx prisma generate
```

## Step 3: Verify Migration

Check that the new tables were created:
- `Reaction` table
- `Poll` table  
- `PollVote` table
- `Message` table should have new `type` and `metadata` columns

## Step 4: Test Features

1. **Test Polls**: Create a poll in chat
2. **Test Reactions**: Add reactions to messages
3. **Test AI Co-pilot**: Type a message and see suggestions
4. **Test Insights**: Chat for a while and view insights

## Troubleshooting

If migration fails:
1. Check your `DATABASE_URL` is correct
2. Ensure you have write permissions
3. Check Prisma schema syntax
4. Try resetting: `npx prisma migrate reset` (⚠️ deletes all data)
