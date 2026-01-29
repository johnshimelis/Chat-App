This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

### Option 1: Use Gemini (Google AI)
- `AI_PROVIDER`: Set to `gemini` (default) or omit
- `GEMINI_API_KEY`: your Gemini API key from https://aistudio.google.com/app/apikey
- `GEMINI_MODEL` (optional): model id to use (defaults to `gemini-2.0-flash`)

### Option 2: Use OpenAI
- `AI_PROVIDER`: Set to `openai`
- `OPENAI_API_KEY`: your OpenAI API key from https://platform.openai.com/api-keys
- `OPENAI_MODEL` (optional): model to use (defaults to `gpt-3.5-turbo`)

### Setting Up Environment Variables

**Option 1: Create a `.env` file** (recommended for local development)
1. Create a file named `.env` in the project root
2. Add your variables:

   **For Gemini:**
   ```
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_api_key_here
   GEMINI_MODEL=gemini-2.0-flash
   ```

   **For OpenAI:**
   ```
   AI_PROVIDER=openai
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo
   ```

**Option 2: Set in your shell** (Windows PowerShell)
```powershell
# For Gemini
$env:AI_PROVIDER="gemini"
$env:GEMINI_API_KEY="your_api_key_here"

# For OpenAI
$env:AI_PROVIDER="openai"
$env:OPENAI_API_KEY="your_openai_key_here"
```

**Option 3: Set in your shell** (Windows CMD)
```cmd
# For Gemini
set AI_PROVIDER=gemini
set GEMINI_API_KEY=your_api_key_here

# For OpenAI
set AI_PROVIDER=openai
set OPENAI_API_KEY=your_openai_key_here
```

**To fix quota issues:**
1. **Use a new Google account**: Create a new API key at https://aistudio.google.com/app/apikey
2. **Switch to OpenAI**: Set `AI_PROVIDER=openai` and add `OPENAI_API_KEY` in your `.env` file
3. **Wait for quota reset**: Free tier quotas usually reset daily

## Troubleshooting

### Quota Exceeded (429 Error)

If you see a "Quota Exceeded" error, you have several options:

1. **Use a new Google account**: Create a new API key with a different Google account at https://aistudio.google.com/app/apikey
2. **Switch to OpenAI**: Set `AI_PROVIDER=openai` and add your `OPENAI_API_KEY` in `.env` file
3. **Wait for quota reset**: Free tier quotas reset daily. The error message will show when you can retry.
4. **Upgrade billing**: Enable billing in your Google Cloud Console to access higher quotas.
5. **Check rate limits**: Visit [Google AI Studio](https://ai.google.dev/gemini-api/docs/rate-limits) for current quota information.

### Model Not Found (404 Error)

If you see a "Model Not Found" error:
- Verify your API key has access to the requested model
- Check available models at [Google AI Studio](https://ai.google.dev/gemini-api/docs/models)
- Try setting `GEMINI_MODEL` to a different model name

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
