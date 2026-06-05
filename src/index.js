
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Disable right-click/context menu on images and protected-content
document.addEventListener('contextmenu', function (e) {
  if (
    e.target.tagName === 'IMG' ||
    e.target.classList.contains('protected-content') ||
    e.target.closest('.protected-content')
  ) {
    e.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Show JS errors on screen to diagnose blank pages
window.addEventListener('error', (e) => {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#c0392b;color:#fff;padding:16px;z-index:999999;font:12px monospace;white-space:pre-wrap;max-height:60vh;overflow:auto';
  el.textContent = 'JS ERROR: ' + e.message + '\n' + e.filename + ':' + e.lineno + '\n' + (e.error && e.error.stack ? e.error.stack : '');
  document.body.appendChild(el);
});
window.addEventListener('unhandledrejection', (e) => {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#e67e22;color:#fff;padding:16px;z-index:999999;font:12px monospace;white-space:pre-wrap;max-height:40vh;overflow:auto';
  el.textContent = 'PROMISE ERROR: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason)) + '\n' + (e.reason && e.reason.stack ? e.reason.stack : '');
  document.body.appendChild(el);
});

// Unregister any existing service workers — they were causing blank pages
// after deploys by serving stale JS bundles from cache
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister());
  });
}
