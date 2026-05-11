# Vercel Environment Setup Guide

## Production URL
- **Main:** https://ai-smart-city-snowy.vercel.app/
- **Preview:** https://ai-smart-city-kpuk5nha7-vlatkogavrilov1-5720s-projects.vercel.app/

## Required Environment Variables for Vercel

### 1. NEXT_PUBLIC_APP_URL (Critical for Email Links)
This variable is used in password reset and email verification links.

**Value:** `https://ai-smart-city-snowy.vercel.app`

**Where to Set:**
1. Go to https://vercel.com/dashboard
2. Select project: **ai-smart-city-snowy**
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - Name: `NEXT_PUBLIC_APP_URL`
   - Value: `https://ai-smart-city-snowy.vercel.app`
   - Environment: Select all (Production, Preview, Development)
5. Click "Save"
6. Redeploy or wait for next deployment

### 2. All Required Variables

| Variable | Type | Value | Purpose |
|----------|------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Your Supabase URL | Database connection |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Your Supabase Anon Key | Frontend auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Your Service Role Key | Backend DB operations |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Public | Your Google Maps API Key | Map functionality |
| `HF_API_KEY` | Secret | Hugging Face API Key | AI chat functionality |
| `RESEND_API_KEY` | Secret | Resend API Key | Email sending |
| `IMAGGA_API_KEY` | Secret | Imagga API Key | Image classification |
| `IMAGGA_API_SECRET` | Secret | Imagga API Secret | Image classification |
| `NEXT_PUBLIC_APP_URL` | Public | `https://ai-smart-city-snowy.vercel.app` | Email link generation |

## How Password Reset Works

1. User clicks "Forgot Password"
2. System sends reset email with link: `{NEXT_PUBLIC_APP_URL}/reset-password?token={TOKEN}`
3. If `NEXT_PUBLIC_APP_URL` is localhost, link points to localhost (won't work in production)
4. **Solution:** Set `NEXT_PUBLIC_APP_URL` to your production URL

## Testing Password Reset

1. Deploy changes or redeploy existing deployment
2. Go to: https://ai-smart-city-snowy.vercel.app/forgot-password
3. Enter your email
4. Check email for reset link (should now have correct production URL)

## Local Development

Keep `NEXT_PUBLIC_APP_URL=http://localhost:3000` in `.env.local` for local testing.

## After Making Changes

- Changes to environment variables take effect on next deployment
- Push code to trigger automatic deployment, OR
- Redeploy manually from Vercel dashboard: Project → Deployments → Click deployment → Redeploy
