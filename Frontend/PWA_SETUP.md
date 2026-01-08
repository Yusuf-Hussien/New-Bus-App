# Progressive Web App (PWA) Setup Guide

Your NewBus application has been configured as a Progressive Web App (PWA) that can be installed on mobile devices and work offline.

## What's Been Added

1. **manifest.json** - Web app manifest file defining app metadata, icons, and display settings
2. **service-worker.js** - Service worker for offline functionality and caching
3. **sw-register.js** - Service worker registration script with install prompt handling
4. **PWA Meta Tags** - Added to all HTML files (login.html, passenger.html, driver.html, admin.html)
5. **Icons Directory** - Placeholder for app icons

## Features

✅ **Installable** - Users can install the app on their mobile devices  
✅ **Offline Support** - Basic offline functionality with cached resources  
✅ **App-like Experience** - Standalone display mode (no browser UI)  
✅ **Fast Loading** - Cached assets load instantly  
✅ **Update Notifications** - Users are notified when new versions are available  

## Setting Up Icons

### Quick Start (Placeholder Icons)

1. Open `icons/generate-placeholder-icons.html` in your browser
2. Click "Generate All Icons"
3. Move the downloaded icons to the `Frontend/icons/` directory

### Custom Icons

1. Create a 512x512px icon with your bus logo/design
2. Use `icons/icon-generator.html` to generate all required sizes
3. Or use online tools like:
   - https://www.pwabuilder.com/imageGenerator
   - https://realfavicongenerator.net/

Required icon sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

## Testing the PWA

### On Desktop (Chrome/Edge)

1. Open your app in the browser
2. Look for the install icon in the address bar
3. Click it to install the app
4. The app will open in a standalone window

### On Mobile (Android)

1. Open your app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen" or "Install App"
4. The app icon will appear on your home screen

### On Mobile (iOS/Safari)

1. Open your app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app icon will appear on your home screen

## Service Worker Features

The service worker provides:

- **Caching**: Static assets are cached for offline access
- **Network Fallback**: If network fails, cached content is served
- **Background Sync**: Ready for offline action queuing
- **Push Notifications**: Ready for push notification support

## Customization

### Update App Name/Description

Edit `manifest.json`:
```json
{
  "name": "Your App Name",
  "short_name": "ShortName",
  "description": "Your app description"
}
```

### Change Theme Color

Update the `theme_color` in:
- `manifest.json`
- All HTML files' meta tags

### Modify Cached Assets

Edit `service-worker.js` and update the `PRECACHE_ASSETS` array.

## HTTPS Requirement

⚠️ **Important**: PWAs require HTTPS (except for localhost). Make sure your production server uses HTTPS.

For local development:
- Use `http://localhost` (works without HTTPS)
- Or set up a local HTTPS server

## Troubleshooting

### Icons Not Showing
- Make sure all icon files exist in `Frontend/icons/` directory
- Check that paths in `manifest.json` are correct
- Clear browser cache and reload

### Service Worker Not Registering
- Check browser console for errors
- Ensure you're using HTTPS (or localhost)
- Verify `service-worker.js` is accessible

### Install Prompt Not Appearing
- App must meet PWA criteria (manifest, service worker, HTTPS)
- User must visit the site at least twice
- Check browser console for installability issues

## Next Steps

1. Generate and add your custom app icons
2. Test the install experience on mobile devices
3. Customize the theme colors to match your brand
4. Add offline functionality for critical features
5. Set up push notifications (optional)

## Resources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: PWA Guide](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/)

