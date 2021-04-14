const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const baseWebpackConfig = require('./webpack.config.base.js');
const getProxy = require('./config');
// const packagesEntry = require('./packages.config');

// 先不用webpack merge
module.exports = [
  {
    ...baseWebpackConfig,
    devtool: 'inline-source-map',
    mode: 'development',
    devServer: {
      contentBase: path.join(__dirname, '../'),
      stats: 'errors-warnings',
      port: 9090,
      host: 'localhost',
      watchOptions: {
        poll: true,
      },
      proxy: getProxy(),
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, '../index.html'),
      }),
      new CaseSensitivePathsPlugin(),
      new ESLintPlugin({
        context: path.resolve(__dirname, '../src'),
        extensions: ['ts', 'tsx'],
      }),
      new webpack.EnvironmentPlugin(['NODE_ENV', 'MOCK_TYPE']),
    ],
  },
];
