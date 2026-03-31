import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Register Service Worker for PWA (makes the app installable on iOS, Android, Windows, Linux)
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
