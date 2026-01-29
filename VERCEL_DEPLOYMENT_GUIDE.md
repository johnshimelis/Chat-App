# Complete Vercel Deployment Guide

## Step-by-Step Instructions to Deploy Your Chat App on Vercel

### Prerequisites
- ✅ Your code is pushed to GitHub
- ✅ You have a Vercel account (free tier works)
- ✅ Your environment variables ready

---

## STEP 1: Verify GitHub Repository

1. **Go to your GitHub repository**
   - Open https://github.com
   - Navigate to your repository

2. **Verify your code is pushed**
   - Make sure all files are committed and pushed
   - Check that `.env` file is NOT in the repository (it should be in `.gitignore`)

---

## STEP 2: Create Vercel Account & Import Project

1. **Go to Vercel**
   - Visit https://vercel.com
   - Click **"Sign Up"** or **"Log In"**

2. **Sign in with GitHub**
   - Click **"Continue with GitHub"**
   - Authorize Vercel to access your GitHub account

3. **Import Your Project**
   - After logging in, you'll see the Vercel dashboard
   - Click **"Add New..."** button
   - Select **"Project"**
   - You'll see a list of your GitHub repositories
   - Find your chat app repository and click **"Import"**

---

## STEP 3: Configure Project Settings

1. **Project Name** (if you want to change it)
   - You can change the project name or keep the default
   - Click **"Continue"**

2. **Framework Preset**
   - Vercel should auto-detect **Next.js**
   - If not, select **"Next.js"** from the dropdown

3. **Root Directory**
   - Leave as **"."** (root) unless your Next.js app is in a subfolder

4. **Build and Output Settings**
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `.next` (should be auto-detected)
   - **Install Command**: `npm install` (should be auto-detected)
   
   ⚠️ **IMPORTANT**: Your app uses Socket.io with a custom server. Vercel's serverless functions don't support WebSockets directly. The Socket.io features may not work on Vercel. Consider:
   - Using Vercel's Edge Functions or a separate WebSocket service
   - Or deploying to a platform that supports WebSockets (Railway, Render, etc.)

5. **Click "Continue"**

---

## STEP 4: Add Environment Variables (CRITICAL!)

This is the most important step! Add all your environment variables:

1. **In the "Environment Variables" section**, click **"Add"** for each variable:

   ### Required Variables:
   
   **For Gemini (Current Setup):**
   ```
   Name: AI_PROVIDER
   Value: gemini
   ```

   ```
   Name: GEMINI_API_KEY
   Value: (Your Gemini API Key)
   ```

   ```
   Name: GEMINI_MODEL
   Value: gemini-2.0-flash
   ```

   **For Database:**
   ```
   Name: DATABASE_URL
   Value: (Your Database Connection String from Neon)
   ```

   **For NextAuth:**
   ```
   Name: NEXTAUTH_URL
   Value: https://your-project-name.vercel.app
   ```
   (You'll update this after first deployment with your actual URL)

   ```
   Name: NEXTAUTH_SECRET
   Value: supersecret
   ```
   (Generate a better secret: run `openssl rand -base64 32` or use https://generate-secret.vercel.app/32)

   **For Google OAuth (if using):**
   ```
   Name: GOOGLE_CLIENT_ID
   Value: (Your Google Client ID)
   ```

   ```
   Name: GOOGLE_CLIENT_SECRET
   Value: (Your Google Client Secret)
   ```

   **Optional - OpenAI (if you want to use it later):**
   ```
   Name: OPENAI_API_KEY
   Value: (Your OpenAI API Key)
   ```

2. **For each variable:**
   - Select **"Production"**, **"Preview"**, and **"Development"** (or just Production if you prefer)
   - Click **"Save"**

3. **Verify all variables are added** before proceeding

---

## STEP 5: Deploy

1. **Click "Deploy" button**
   - Vercel will start building your project
   - This may take 2-5 minutes

2. **Watch the build process**
   - You'll see build logs in real-time
   - Wait for it to complete

---

## STEP 6: Update NEXTAUTH_URL (After First Deployment)

1. **After deployment completes**, you'll get a URL like:
   - `https://your-project-name.vercel.app`

2. **Update NEXTAUTH_URL:**
   - Go to your project in Vercel dashboard
   - Click **"Settings"** → **"Environment Variables"**
   - Find `NEXTAUTH_URL`
   - Update the value to your actual Vercel URL
   - Click **"Save"**

3. **Redeploy:**
   - Go to **"Deployments"** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**

---

## STEP 7: Verify Deployment

1. **Visit your deployed site**
   - Click the deployment URL
   - Your app should be live!

2. **Test the features:**
   - Try logging in
   - Test the AI chat
   - Check if everything works

---

## STEP 8: Update Google OAuth Redirect URLs (If Using Google Login)

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com
   - Navigate to **APIs & Services** → **Credentials**

2. **Edit your OAuth 2.0 Client**
   - Find your OAuth client
   - Click **Edit**

3. **Add Authorized Redirect URIs:**
   ```
   https://your-project-name.vercel.app/api/auth/callback/google
   ```

4. **Save changes**

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Make sure all environment variables are set
- Verify `package.json` has correct build script

### Environment Variables Not Working
- Make sure variables are set for **Production** environment
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if your database allows connections from Vercel IPs
- For Neon/PostgreSQL, make sure connection string includes SSL

### NextAuth Not Working
- Verify `NEXTAUTH_URL` matches your Vercel domain
- Check `NEXTAUTH_SECRET` is set
- Make sure OAuth redirect URLs are updated

### AI Chat Not Working
- Verify `GEMINI_API_KEY` is set correctly
- Check `AI_PROVIDER=gemini` is set
- Look at Vercel function logs for errors

---

## Quick Reference: Environment Variables Checklist

Copy this checklist and mark as you add each variable:

- [ ] `AI_PROVIDER` = `gemini`
- [ ] `GEMINI_API_KEY` = `your_key`
- [ ] `GEMINI_MODEL` = `gemini-2.0-flash`
- [ ] `DATABASE_URL` = `your_database_url`
- [ ] `NEXTAUTH_URL` = `https://your-project.vercel.app`
- [ ] `NEXTAUTH_SECRET` = `your_secret`
- [ ] `GOOGLE_CLIENT_ID` = `your_client_id`
- [ ] `GOOGLE_CLIENT_SECRET` = `your_client_secret`
- [ ] `OPENAI_API_KEY` = `your_key` (optional)

---

## Additional Tips

1. **Custom Domain** (Optional):
   - Go to **Settings** → **Domains**
   - Add your custom domain

2. **Environment Variables for Different Environments:**
   - You can set different values for Production, Preview, and Development
   - Useful for testing

3. **Automatic Deployments:**
   - Every push to `main` branch auto-deploys
   - Preview deployments for pull requests

4. **View Logs:**
   - Go to **Deployments** → Click on a deployment → **Functions** tab
   - See real-time logs and errors

---

## Success! 🎉

Your app should now be live on Vercel! 

**Your deployment URL will be:**
`https://your-project-name.vercel.app`

Remember to:
- ✅ Update `NEXTAUTH_URL` after first deployment
- ✅ Update Google OAuth redirect URLs
- ✅ Test all features
- ✅ Monitor logs for any issues

Good luck with your deployment! 🚀
