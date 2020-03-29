const webpackConfig = require('@nrwl/react/plugins/webpack');

module.exports = config => {
  config.module.rules.push(
    {
      test: /\.(eot|ttf|woff|woff2)$/i,
      use: [
        {
          loader: 'file-loader',
        },
      ],
    },
    {
      test: /\.(graphql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    }
  );
  return webpackConfig(config);
};
