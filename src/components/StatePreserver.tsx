import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * StatePreserver component helps maintain application state
 * and prevents unwanted page refreshes on mobile devices.
 */
const StatePreserver: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Store current route in sessionStorage to restore on refresh
    sessionStorage.setItem('lastRoute', location.pathname + location.search);
    
    // Function to handle page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // When page becomes visible again, ensure we're on the right route
        const lastRoute = sessionStorage.getItem('lastRoute');
        const currentRoute = location.pathname + location.search;
        
        if (lastRoute && lastRoute !== currentRoute) {
          console.log('Restoring last route:', lastRoute);
          // We don't navigate here to avoid loops, just log the discrepancy
          // The navigation prevention in main.tsx should prevent most issues
        }
      }
    };

    // Function to handle mobile memory warnings
    const handleMemoryWarning = () => {
      console.log('Low memory warning detected');
      // Attempt to free up resources
      
      // Store essential state
      sessionStorage.setItem('appStatePreserved', 'true');
      sessionStorage.setItem('lastRoute', location.pathname + location.search);
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Some browsers/devices support memory warning events
    if ('onmemorywarning' in window) {
      window.addEventListener('memorywarning', handleMemoryWarning);
    }

    return () => {
      // Clean up event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if ('onmemorywarning' in window) {
        window.removeEventListener('memorywarning', handleMemoryWarning);
      }
    };
  }, [location]);

  // This component doesn't render anything
  return null;
};

export default StatePreserver;

// Add TypeScript declaration for memory warning event
declare global {
  interface Window {
    onmemorywarning?: any;
  }
}