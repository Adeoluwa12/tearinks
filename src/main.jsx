import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,   // 2 min
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

// Register PWA service worker (vite-plugin-pwa generates this at build time)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    import('virtual:pwa-register').then(({ registerSW }) => {
      registerSW({
        onNeedRefresh() {
          // Optional: show a "new version available" toast here
          console.info('[PWA] New content available, refresh to update.');
        },
        onOfflineReady() {
          console.info('[PWA] App ready to work offline.');
        },
      });
    }).catch(() => {
      // virtual:pwa-register only exists after build, silently skip in dev
    });
  });
}
