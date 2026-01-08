# App Icons for NewBus PWA

This directory should contain the following icon sizes for the Progressive Web App:

- ✅ icon-72x72.png
- ✅ icon-96x96.png
- ✅ icon-128x128.png
- ✅ icon-144x144.png
- ✅ icon-152x152.png
- ✅ icon-192x192.png
- ✅ icon-384x384.png
- ✅ icon-512x512.png

## 🚀 Quick Generation (Recommended)

### **EASIEST METHOD: Auto-Generator**
1. **Double-click** `generate-icons-auto.html` (opens in browser)
2. Icons **automatically generate** on page load
3. Click **"📥 Download All Icons"** button
4. Move downloaded files to this `icons/` directory
5. **Done!** ✅ Ready for GitHub/Vercel deployment

**OR** use the batch file: Double-click `generate-icons.bat`

## Alternative Methods

### Option 2: Python Script
```bash
pip install Pillow
python generate-icons.py
```

### Option 3: Node.js Script
```bash
npm install canvas
node generate-icons.js
```

### Option 4: Custom Icons
1. Create a 512x512px PNG with your logo
2. Open `icon-generator.html` in browser
3. Upload your image and generate all sizes

## ⚠️ Important for Deployment

- **Icons are REQUIRED** for PWA installation on mobile devices
- Without icons, the app won't be installable
- All 8 icon files must be in this directory before deploying to Vercel
- Icons are automatically included when you push to GitHub

## Icon Specifications

- **Format**: PNG
- **Background**: #4A90E2 (NewBus theme color)
- **Design**: Bus icon with white body and blue windows
- **Sizes**: All 8 sizes listed above

See `QUICK_GENERATE.md` for detailed step-by-step instructions.

