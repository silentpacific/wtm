// Updated index.tsx - Fixed to use BrowserRouter for clean URLs
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Changed from HashRouter
import { initErrorTracking } from './services/errorTracking';
import App from './App';

// Initialize error tracking FIRST
initErrorTracking();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);