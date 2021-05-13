const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const baseWebpackConfig = require('./webpack.config.base.js');

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
      }
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, '../index.html'),
        inject: false,
      }),
      new CaseSensitivePathsPlugin(),
      new ESLintPlugin({
        context: path.resolve(__dirname, '../src'),
        extensions: ['ts', 'tsx'],
      })
    ],
  },
];
