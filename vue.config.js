module.exports = {
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
  },
  pluginOptions: {
    i18n: {
      locale: 'jp',
      fallbackLocale: 'jp',
      localeDir: 'locales',
      enableInSFC: false,
    },
  },
};
