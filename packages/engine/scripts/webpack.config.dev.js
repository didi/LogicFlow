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
      contentBase: path.join(__dirname, '../../'),
      stats: 'errors-warnings',
      port: 9094,
      host: '127.0.0.1',
      watchOptions: {
        poll: true,
      },
    },
    plugins: [
      new CaseSensitivePathsPlugin(),
      // new ESLintPlugin({
      //   extensions: ['ts', 'tsx'],
      // }),
    ],
  },
];
