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

Set these in your environment (or via a local `.env` file) before starting the server:

- `GEMINI_API_KEY`: your Gemini API key
- `GEMINI_MODEL` (optional): model id to use (defaults to `gemini-2.0-flash`)

## Troubleshooting

### Quota Exceeded (429 Error)

If you see a "Quota Exceeded" error, it means you've reached your free tier limit for the Gemini API. Solutions:

1. **Wait for quota reset**: Free tier quotas reset daily. The error message will show when you can retry.
2. **Switch models**: Try a different model by setting `GEMINI_MODEL` to another supported model (e.g., `gemini-1.5-flash`, `gemini-1.5-pro`).
3. **Upgrade billing**: Enable billing in your Google Cloud Console to access higher quotas.
4. **Check rate limits**: Visit [Google AI Studio](https://ai.google.dev/gemini-api/docs/rate-limits) for current quota information.

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
