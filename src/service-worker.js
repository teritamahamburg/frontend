/* eslint-disable */
workbox.core.setCacheNameDetails({prefix: "asemana"});
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', (event) => {if (event.data && event.data.type === 'SKIP_WAITING') skipWaiting();});
