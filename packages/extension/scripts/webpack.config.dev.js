const path = require('path');
const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
// const ESLintPlugin = require('eslint-webpack-plugin');
const baseWebpackConfig = require('./webpack.config.base.js');

// 先不用webpack merge
module.exports = [
  {
    ...baseWebpackConfig,
    devtool: 'inline-source-map',
    mode: 'development',
    devServer: {
      contentBase: path.join(__dirname, '../examples/'),
      stats: 'errors-warnings',
      port: 9092,
      host: 'localhost',
      watchOptions: {
        poll: true,
      },
    },
    plugins: [
      new CaseSensitivePathsPlugin(),
      // new ESLintPlugin({
      //   extensions: ['ts', 'tsx'],
      // }),
      new webpack.EnvironmentPlugin(['NODE_ENV', 'MOCK_TYPE']),
    ],
  },
];
