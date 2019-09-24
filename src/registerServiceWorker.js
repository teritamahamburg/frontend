import { Workbox } from 'workbox-window';

if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    const isUpdateAvailable = Symbol('isUpdateAvailable');
    window.isUpdateAvailable = new Promise((resolve) => {
      window[isUpdateAvailable] = (onAccept) => {
        resolve(onAccept);
      };
    });

    const wb = new Workbox(`${process.env.BASE_URL}service-worker.js`);

    wb.addEventListener('waiting', () => {
      window[isUpdateAvailable](() => {
        wb.addEventListener('controlling', () => {
          window.location.reload();
        });

        wb.messageSW({ type: 'SKIP_WAITING' });
      });
    });

    wb.register();
  }
}
