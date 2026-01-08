// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              if (confirm('A new version of NewBus is available. Reload to update?')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });

  // Listen for service worker messages
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('Message from service worker:', event.data);
  });
}

  // Handle install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show custom install button/prompt (only if not dismissed recently)
  const dismissed = localStorage.getItem('installBannerDismissed');
  if (!dismissed || (Date.now() - parseInt(dismissed)) > 7 * 24 * 60 * 60 * 1000) {
    showInstallPrompt();
  }
});

// Function to show install prompt
function showInstallPrompt() {
  // You can customize this to show your own install button
  const installBanner = document.createElement('div');
  installBanner.id = 'install-banner';
  installBanner.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #4A90E2;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 15px;
    font-family: 'Cairo', sans-serif;
  `;
  installBanner.innerHTML = `
    <span>📱 Install NewBus App</span>
    <button id="install-btn" style="
      background: white;
      color: #4A90E2;
      border: none;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
    ">Install</button>
    <button id="dismiss-install" style="
      background: transparent;
      color: white;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 0 5px;
    ">×</button>
  `;
  
  document.body.appendChild(installBanner);
  
  document.getElementById('install-btn').addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      deferredPrompt = null;
      installBanner.remove();
    }
  });
  
  document.getElementById('dismiss-install').addEventListener('click', () => {
    installBanner.remove();
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('installBannerDismissed', Date.now());
  });
  
  // Check if user previously dismissed
  const dismissed = localStorage.getItem('installBannerDismissed');
  if (dismissed) {
    const daysSinceDismissal = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissal < 7) {
      installBanner.remove();
    }
  }
}

// Handle app installed
window.addEventListener('appinstalled', () => {
  console.log('NewBus app was installed');
  deferredPrompt = null;
  const banner = document.getElementById('install-banner');
  if (banner) banner.remove();
});

