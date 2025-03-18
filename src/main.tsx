import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
// Import PWA Elements
import { defineCustomElements } from '@ionic/pwa-elements/loader';

// Register PWA Elements
defineCustomElements(window);

// Prevent accidental page refreshes, especially on mobile
if (window.navigator.userAgent.toLowerCase().includes('mobile')) {
  // Prevent accidental refreshes when the app loses focus
  window.addEventListener('beforeunload', (event) => {
    // Only prevent unload if we're not explicitly navigating away
    if (!window.isIntentionalNavigation) {
      event.preventDefault();
      // Chrome requires returnValue to be set
      event.returnValue = '';
      return '';
    }
  });
  
  // Handle page visibility changes to maintain state
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // When page becomes visible again, ensure we don't reload
      console.log('App returned to foreground');
    }
  });
}

// Set up global navigation tracking
window.isIntentionalNavigation = false;

// Override history methods to track intentional navigation
const originalPushState = history.pushState;
history.pushState = function() {
  window.isIntentionalNavigation = true;
  setTimeout(() => { window.isIntentionalNavigation = false; }, 100);
  return originalPushState.apply(this, arguments as any);
};

const originalReplaceState = history.replaceState;
history.replaceState = function() {
  window.isIntentionalNavigation = true;
  setTimeout(() => { window.isIntentionalNavigation = false; }, 100);
  return originalReplaceState.apply(this, arguments as any);
};

// Wrap in StrictMode to help identify potential problems
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("Root element not found");
}

// Add TypeScript declaration for our custom window property
declare global {
  interface Window {
    isIntentionalNavigation: boolean;
  }
}
