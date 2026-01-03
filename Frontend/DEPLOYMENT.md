# Vercel Deployment Guide for NewBus Frontend

This guide will help you deploy the NewBus Frontend to Vercel.

## Prerequisites

1. A GitHub account with your repository
2. A Vercel account (sign up at [vercel.com](https://vercel.com))
3. Your backend API URL (currently: `https://newbus.tryasp.net/api/`)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com) and sign in
   - Click "Add New..." → "Project"

2. **Import Your Repository**
   - Select your GitHub repository
   - Authorize Vercel to access your GitHub if prompted

3. **Configure Project Settings**
   - **Root Directory**: Set to `Frontend`
     - Click "Configure Project"
     - Under "Root Directory", click "Edit"
     - Select `Frontend` folder
     - Click "Continue"
   - **Note**: The `vercel.json` in the repo root is configured to serve from Frontend directory

4. **Build Settings**
   - **Framework Preset**: Other (or leave blank for static site)
   - **Build Command**: Leave empty (static site, no build needed)
   - **Output Directory**: `.` (current directory)
   - **Install Command**: Leave empty

5. **Environment Variables** (if needed)
   - No environment variables required for static deployment
   - If you need to change the backend URL, you can add it here later

6. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Frontend Directory**
   ```bash
   cd Frontend
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts:
     - Set up and deploy? **Yes**
     - Which scope? Select your account
     - Link to existing project? **No** (for first deployment)
     - Project name? **newbus-frontend** (or your preferred name)
     - Directory? **.** (current directory)
     - Override settings? **No**

5. **Production Deployment**
   ```bash
   vercel --prod
   ```

## Post-Deployment Configuration

### Backend API URL

Your frontend files currently use hardcoded API URLs:
- `driver.js`: `https://newbus.tryasp.net/api/`
- `passenger.js`: Uses CONFIG
- `admin.js`: `https://newbus.tryasp.net/api/`
- `login.js`: `https://newbus.tryasp.net/api/`

**Note**: There's also a `config.js` file with `BASE_API_URL: "https://newbus.runasp.net/"`, but it doesn't appear to be loaded in any HTML files.

If you need to update the backend URL:
1. Update the `API_BASE_URL` constant in each JavaScript file, OR
2. Add `<script src="config.js"></script>` to your HTML files and update the code to use `CONFIG.BASE_API_URL`

### Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## File Structure

The deployment includes:
```
Frontend/
├── vercel.json          # Vercel configuration
├── .vercelignore        # Files to exclude from deployment
├── *.html              # Main HTML files
├── *.css               # Global styles
├── config.js           # API configuration (currently unused)
├── driver/             # Driver app files
├── passenger/          # Passenger app files
├── admin/              # Admin panel files
└── login/              # Login page files
```

## Verification

After deployment, verify:
1. ✅ All pages load correctly
2. ✅ API calls work (check browser console for errors)
3. ✅ Static assets (CSS, JS, images) load properly
4. ✅ Routes work (login.html, driver.html, passenger.html, admin.html)

## Troubleshooting

### CORS Issues
If you encounter CORS errors:
- Ensure your backend server has CORS configured to allow requests from your Vercel domain
- The backend should allow: `https://your-project.vercel.app`

### 404 Errors
- Check that all file paths are relative (not absolute)
- Verify `vercel.json` routing configuration

### API Connection Issues
- Verify the backend URL in your JavaScript files
- Check browser console for network errors
- Ensure backend is accessible from the internet

## Continuous Deployment

Vercel automatically deploys when you push to your connected branch:
- **Production**: `main` or `master` branch
- **Preview**: All other branches

## Support

For issues:
1. Check Vercel deployment logs
2. Check browser console for JavaScript errors
3. Verify backend API is accessible

---

**Deployment Status**: ✅ Ready for deployment
**Last Updated**: $(date)

