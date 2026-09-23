export function registerPWA() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
      console.error('ApexPrep PWA registration failed:', error);
    });
  });
}
