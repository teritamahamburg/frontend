module.exports = {
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
    proxy: {
      '/graphql': {
        target: 'http://localhost:8081',
      },
      '/seal': {
        target: 'http://localhost:8081',
      },
    },
  },
  pwa: {
    name: 'あせまな',
    themeColor: '#FAFAFA',
    msTileColor: '#FAFAFA',
    appleMobileWebAppCapable: 'yes',
    manifestOptions: {
      display: 'fullscreen',
    },
    iconPaths: {
      favicon32: 'img/icons/x32.png',
      favicon16: 'img/icons/x16.png',
      appleTouchIcon: 'img/icons/x152.png',
      msTileImage: 'img/icons/x144.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
    },
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/service-worker.js',
      swDest: 'service-worker.js',
    },
  },
  pluginOptions: {
    i18n: {
      locale: 'ja',
      fallbackLocale: 'ja',
      localeDir: 'locales',
      enableInSFC: false,
    },
  },
  configureWebpack: {
    resolveLoader: {
      modules: ['lib'],
    },
  },
  chainWebpack: (config) => {
    config.module
      .rule('css')
      .oneOf('normal')
      .use('css-font-display-loader')
      .loader('css-font-display-loader');
  },
};
