import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// Register Service Worker for PWA with controlled update notification
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        console.log('[PWA] ServiceWorker registered with scope:', registration.scope);

        // Check for SW updates
        registration.update();

        const notifyUpdateAvailable = (worker: ServiceWorker) => {
          window.dispatchEvent(new CustomEvent('swUpdateAvailable', {
            detail: {
              worker,
              applyUpdate: () => {
                worker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          }));
        };

        if (registration.waiting) {
          notifyUpdateAvailable(registration.waiting);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New version downloaded in background.');
                notifyUpdateAvailable(newWorker);
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[PWA] ServiceWorker registration failed:', error);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
