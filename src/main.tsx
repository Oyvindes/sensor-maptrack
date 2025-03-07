import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
// Import PWA Elements
import { defineCustomElements } from '@ionic/pwa-elements/loader';

// Register PWA Elements
defineCustomElements(window);

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
