/* eslint-disable import/no-extraneous-dependencies */
const loaderUtils = require('loader-utils');
const postcss = require('postcss');
const fontDisplay = require('postcss-font-display');

// eslint-disable-next-line func-names
module.exports = function (source, map) {
  this.cacheable();
  const option = Object.assign({
    display: 'swap',
    replace: false,
    sourceMap: false,
  }, loaderUtils.getOptions(this));

  const callback = this.async();
  postcss([fontDisplay(option)])
    .process(source, {
      from: undefined,
      map: option.sourceMap,
    })
    .then((str) => {
      callback(null, str, map);
    })
    .catch(() => {
      callback(null, source, map);
    });
};
