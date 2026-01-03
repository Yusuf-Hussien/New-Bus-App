# Vercel Deployment Configuration

## ✅ Configuration Complete

Your repository is now configured for Vercel deployment with:

- ✅ `vercel.json` in root directory
- ✅ `.vercelignore` excluding Backend and Documentation
- ✅ Landing page set to `Frontend/login.html`
- ✅ All routes configured properly

## 📁 Files Created

1. **`vercel.json`** (root) - Main Vercel configuration
   - Routes root "/" to Frontend/login.html
   - Excludes Backend and Documentation from build
   - Sets up security headers and caching

2. **`.vercelignore`** (root) - Excludes directories from deployment
   - Backend/
   - Documentation/

## 🚀 Deployment Steps

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Vercel configuration"
   git push
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - **Important**: Leave Root Directory as **root** (`.`) - do NOT change it
   - The `vercel.json` in root will handle routing to Frontend
   - Click "Deploy"

3. **Your site will be live!**
   - Root URL ("/") → serves Frontend/login.html
   - Other routes work automatically

### Option 2: Alternative - Set Root Directory in Dashboard

If you prefer to set Root Directory to "Frontend" in Vercel dashboard:
- You would need to move `vercel.json` to Frontend/ directory
- But current setup works better with vercel.json in root

## 🔗 URL Structure

After deployment:
- `https://your-project.vercel.app/` → Frontend/login.html
- `https://your-project.vercel.app/login.html` → Frontend/login.html
- `https://your-project.vercel.app/driver.html` → Frontend/driver.html
- `https://your-project.vercel.app/passenger.html` → Frontend/passenger.html
- `https://your-project.vercel.app/admin.html` → Frontend/admin.html
- Static assets work automatically (CSS, JS, images)

## ⚙️ Configuration Details

### What's Ignored
- ✅ Backend/ directory (not needed for frontend)
- ✅ Documentation/ directory (not needed for deployment)

### Landing Page
- ✅ Root route "/" automatically serves `Frontend/login.html`

### Security Headers
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-XSS-Protection enabled

### Caching
- ✅ Static assets (JS, CSS, images) cached for 1 year

## 🔧 Troubleshooting

### If deployment fails:
1. Check that `vercel.json` is in root directory
2. Verify `.vercelignore` is in root directory
3. Ensure Root Directory in Vercel dashboard is set to root (`.`)
4. Check deployment logs in Vercel dashboard

### If routes don't work:
1. Verify `vercel.json` syntax is valid JSON
2. Check that Frontend directory structure is correct
3. Ensure all HTML files are in Frontend/ directory

## 📝 Notes

- Backend API URL: Currently hardcoded in JS files as `https://newbus.tryasp.net/api/`
- Make sure your backend allows CORS from your Vercel domain
- All frontend files are served from Frontend/ directory

---

**Status**: ✅ Ready to deploy!
**Next Step**: Push to GitHub and connect to Vercel

