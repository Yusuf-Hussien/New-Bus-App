# Quick Start: Deploy to Vercel in 5 Minutes

## Fastest Method (Recommended)

1. **Go to**: https://vercel.com/new
2. **Import** your GitHub repository
3. **Configure**:
   - Root Directory: Leave as root (`.`)
   - Framework Preset: Other
   - Leave Build/Output commands empty
   - **Note**: The `vercel.json` in root is already configured to serve from Frontend directory and set login.html as landing page
4. **Click "Deploy"**

That's it! 🎉

**The vercel.json in your repo root will:**
- ✅ Automatically ignore Backend and Documentation directories
- ✅ Serve files from Frontend directory
- ✅ Set login.html as the landing page (route "/")

Your site will be live at: `https://your-project.vercel.app`

## What You Need

✅ GitHub repository with your code  
✅ Vercel account (free)  
✅ Backend API already deployed (you mentioned it's on a remote server)

## Important Notes

- Your backend API URL is currently: `https://newbus.tryasp.net/api/`
- Make sure your backend allows CORS from your Vercel domain
- All HTML files are ready: `login.html`, `driver.html`, `passenger.html`, `admin.html`

## After Deployment

Visit your Vercel dashboard to:
- Get your live URL
- Add a custom domain (optional)
- View deployment logs

---

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

