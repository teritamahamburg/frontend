// eslint-disable-next-line import/prefer-default-export
export const csvDownload = (csv, filename = 'items.csv') => {
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.target = '_blank';
  a.download = filename;
  a.href = window.URL.createObjectURL(blob);
  /* a.click(); // <- not working in firefox */
  const event = document.createEvent('MouseEvents');
  event.initEvent('click', true, true);
  a.dispatchEvent(event);
};
