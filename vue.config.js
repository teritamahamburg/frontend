module.exports = {
  lintOnSave: false,
  devServer: {
    compress: true,
    disableHostCheck: true,
    port: 8080,
    public: 'localhost:8080',
    proxy: 'http://localhost:8081',
  },
};
