const webpackConfig = require('@nrwl/react/plugins/webpack');

module.exports = config => {
  config.module.rules.unshift({
    test: /\.(eot|ttf|woff|woff2)$/i,
    use: [
      {
        loader: 'file-loader',
      },
    ],
  });
  return webpackConfig(config);
};
