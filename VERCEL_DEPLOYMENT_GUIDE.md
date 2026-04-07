# Vercel Deployment Guide for Smart City Reporter

## ✅ Pre-Deployment Checklist

- [x] Next.js 16.2.2 with App Router (`/app` directory)
- [x] Build test passed locally (`npm run build`)
- [x] All code committed and pushed to `main` branch on GitHub
- [x] Environment variables configured locally (`.env.local`)
- [x] TypeScript type checking passed

## 📋 Project Details

- **Framework**: Next.js 16.2.2
- **Repository**: https://github.com/gavrilov001/Ai-Smart-City-Reporter
- **Main Branch**: `main`
- **App Router**: Yes (`/app` directory)
- **Build Command**: `next build`
- **Start Command**: `next start`
- **Package Manager**: npm

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Verify GitHub Repository is Ready

Your code is already on GitHub with the latest changes:
```bash
# Current status:
# Branch: main
# Latest commits include all features and bug fixes
# Build test: PASSED ✓
```

### Step 2: Deploy to Vercel (Choose One Method)

#### **Option A: Via Vercel Dashboard (Recommended for First Time)**

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Find and click on **"Ai-Smart-City-Reporter"** repository
5. Configure project settings:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./smart-city-reporter` (if monorepo) or default
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://omszejcfxmfmjmfodrkv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tc3plamNmeG1mbWptZm9kcmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMTg1MzgsImV4cCI6MjA5MDg5NDUzOH0.iJtmXrC9uZ8993rpKJu4jApPZGbVnF2g2JQAmxqO0Lk
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCiyG8zcPjJTBinGjdQDT_vYxd-i8TJf5k
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tc3plamNmeG1mbWptZm9kcmt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTMxODUzOCwiZXhwIjoyMDkwODk0NTM4fQ.hobGZ5U8dFIMkiGqUuZkalT28h8UUvPab6wP0mE9cgk
   ```
7. Click **"Deploy"** and wait for the build to complete
8. Once deployed, you'll get a URL like: `https://smart-city-reporter-XXXXX.vercel.app`

#### **Option B: Via Vercel CLI (Faster)**

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy to Vercel
cd /Users/vlatkogavrilov/Documents/Ai-Smart-City-Reporter/smart-city-reporter
vercel

# 3. Follow the prompts:
# - Link to existing project or create new
# - Set project name: smart-city-reporter
# - Framework: Next.js
# - Build settings: Confirm defaults
# - Deploy: yes

# 4. Add environment variables via CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 5. Redeploy with variables:
vercel --prod
```

### Step 3: Configure Production Deployment

Once project exists on Vercel:

1. Go to **Project Settings** → **Git** → **Connected Git Repository**
2. Verify:
   - Repository: `gavrilov001/Ai-Smart-City-Reporter`
   - Branch: `main` (for production)
3. Enable **Automatic Deployments** (should be on by default)

### Step 4: Verify Deployment

1. Visit your Vercel deployment URL
2. Verify the page redirects to `/login` (not Next.js starter page)
3. Check that:
   - Login page loads correctly
   - Supabase connection works
   - Google Maps API loads
   - No console errors in browser DevTools

### Step 5: Configure Production Environment Variables

In Vercel Dashboard → **Settings** → **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | (from `.env.local`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (from `.env.local`) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | (from `.env.local`) |
| `SUPABASE_SERVICE_ROLE_KEY` | (from `.env.local`) |

## 🔄 Automatic Deployments

Once connected, every push to `main` branch will:
1. Trigger a new Vercel build
2. Run `npm run build`
3. Deploy to production if build succeeds
4. Show status in GitHub commits

## 🆘 Troubleshooting

### Issue: Build Fails
```bash
# Check build locally
npm run build

# Check for TypeScript errors
npm run lint

# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Issue: Shows Next.js Starter Page
- Verify `/app/page.tsx` redirects to login
- Check root `layout.tsx` is configured
- Redeploy with: `vercel --prod`

### Issue: Environment Variables Not Available
- Verify all variables in Vercel Dashboard **Settings** → **Environment Variables**
- Must include `NEXT_PUBLIC_` prefix for client-side variables
- Redeploy after adding variables

### Issue: Supabase Connection Fails
- Verify Supabase URL and Keys are correct
- Check Supabase RLS policies
- Ensure Supabase tables exist

## 📊 Monitoring Deployment

View deployment logs:
```bash
vercel logs
```

View function performance:
- Dashboard → **Analytics** tab

## 🎯 Current Status

✅ **Ready for Production**
- Code pushed to main branch
- Local build test passed
- All dependencies configured
- Environment variables documented

**Next Steps:**
1. Choose deployment method (Dashboard or CLI)
2. Add environment variables
3. Deploy to production
4. Share the production URL

## 📝 Production URL

Once deployed, your app will be accessible at:
```
https://smart-city-reporter-XXXXX.vercel.app
```

Or with a custom domain if configured.

---

**Need Help?** Check Vercel docs: https://vercel.com/docs
